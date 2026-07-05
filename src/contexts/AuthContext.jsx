import { createContext, useContext, useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [staff, setStaff] = useState(null)
  const [permissions, setPermissions] = useState({})
  const [loading, setLoading] = useState(true)
  const loadingResolved = useRef(false)
  const loadedUserIdRef = useRef(null)
  const loadInFlightRef = useRef(null)

  function finishLoading() {
    if (!loadingResolved.current) {
      loadingResolved.current = true
      setLoading(false)
    }
  }

  // Fetch staff profile + permissions for logged-in user.
  //
  // CRITICAL: This function is called from the onAuthStateChange listener which
  // was registered inside a useEffect with empty deps. That means the listener
  // captured the FIRST render's `loadProfile`, which forever closes over an
  // initial `staff = null`. We MUST NOT use the `staff` closure inside this
  // function — always consult `loadedUserIdRef.current` instead (refs are
  // always current). If we use stale `staff`, the error-handler branches
  // clobber real data and flash "Loading profile..." on every auth event.
  //
  // Requirements:
  //   1. Skip work if we already loaded this user (same-user token refresh)
  //   2. NEVER null-clobber staff/permissions if we've ever successfully loaded
  //   3. Retry with backoff on timeout — don't leave the UI stuck
  //   4. Hard timeout so a hung fetch can't freeze the app forever
  async function loadProfile(userId, { force = false, attempt = 0 } = {}) {
    if (!supabase || !userId) {
      // Only clobber if we truly have nothing loaded yet (first time).
      if (loadedUserIdRef.current === null) {
        setStaff(null)
        setPermissions({})
      }
      return
    }

    // Skip if we already loaded THIS user — ref-based, not closure-based.
    if (!force && loadedUserIdRef.current === userId) {
      return
    }

    // Coalesce concurrent in-flight loads for the same user.
    if (loadInFlightRef.current && loadInFlightRef.current.userId === userId) {
      return loadInFlightRef.current.promise
    }

    const promise = (async () => {
      try {
        // Hard 8-second timeout so a hung query can't freeze the UI.
        const withTimeout = (p, ms = 8000) =>
          Promise.race([
            p,
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error('profile-fetch-timeout')), ms)
            ),
          ])

        const { data: staffRow, error: staffErr } = await withTimeout(
          supabase
            .from('staff')
            .select('*')
            .eq('auth_user_id', userId)
            .single()
        )

        if (staffErr || !staffRow) {
          console.error('No staff profile found for auth user:', staffErr)
          // Only clear if we've never loaded anyone (ref-based check).
          if (loadedUserIdRef.current === null) {
            setStaff(null)
            setPermissions({})
          }
          return
        }

        setStaff(staffRow)
        loadedUserIdRef.current = userId

        const { data: perms, error: permsErr } = await withTimeout(
          supabase
            .from('role_permissions')
            .select('permission_key, enabled')
            .eq('role', staffRow.role)
        )

        if (permsErr) {
          console.error('Error fetching permissions:', permsErr)
          // Keep whatever permissions we already had rather than blanking
          return
        }

        const permMap = {}
        perms?.forEach((p) => {
          permMap[p.permission_key] = p.enabled
        })
        setPermissions(permMap)
      } catch (err) {
        console.error('Error loading profile:', err?.message || err)

        // Retry-with-backoff for transient timeouts. Up to 2 retries at 1.5s + 3s.
        if (err?.message === 'profile-fetch-timeout' && attempt < 2) {
          const delay = (attempt + 1) * 1500
          console.warn(
            `Profile fetch timed out — retrying in ${delay}ms (attempt ${attempt + 1}/2)`
          )
          loadInFlightRef.current = null
          await new Promise((r) => setTimeout(r, delay))
          return loadProfile(userId, { force, attempt: attempt + 1 })
        }

        // Final failure: only clobber if we've never successfully loaded anyone.
        // If we already have a valid profile, a transient network hiccup must
        // NEVER flip staff to null — that triggers ProtectedRoute's spinner flash.
        if (loadedUserIdRef.current === null) {
          setStaff(null)
          setPermissions({})
        }
      } finally {
        loadInFlightRef.current = null
      }
    })()

    loadInFlightRef.current = { userId, promise }
    return promise
  }

  // Initialize auth on mount
  useEffect(() => {
    if (!supabase) {
      finishLoading()
      return
    }

    // Safety timeout — if everything takes longer than 10 seconds, just show login.
    // With navigator.locks bypassed this should never fire, but kept as a safety net.
    const timeout = setTimeout(() => {
      if (!loadingResolved.current) {
        console.warn('Auth loading timeout — finishing loading')
        finishLoading()
      }
    }, 10000)

    // Get initial session (resolves instantly now that navigator.locks are bypassed)
    supabase.auth
      .getSession()
      .then(({ data: { session: s } }) => {
        setSession(s)
        if (s?.user) {
          loadProfile(s.user.id).finally(() => finishLoading())
        } else {
          finishLoading()
        }
      })
      .catch((err) => {
        console.error('Error getting session:', err)
        finishLoading()
      })

    // Subscribe to auth state changes (handles token refresh, sign-out from other tabs, etc.)
    //
    // Event handling rules:
    //   SIGNED_OUT       — the ONLY event that clears staff/permissions. Explicit only.
    //   TOKEN_REFRESHED  — update session silently; NEVER touch staff or re-fetch profile.
    //                       This is the key fix: Supabase can fire this during any
    //                       DB query the app makes, and re-fetching profile every
    //                       time causes the "Loading profile..." flash.
    //   INITIAL_SESSION  — same as TOKEN_REFRESHED; if we have the user, do nothing.
    //   SIGNED_IN        — only re-fetch profile if user.id actually changed.
    //   USER_UPDATED     — force re-fetch (role/metadata may have changed).
    //
    // We deliberately do NOT null-out staff when session goes transiently falsy.
    // Only SIGNED_OUT genuinely clears session; anything else is treated as a
    // transient state and does not cascade into ProtectedRoute's spinner branch.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, s) => {
      // Explicit sign-out: clear everything.
      if (event === 'SIGNED_OUT') {
        setSession(null)
        setStaff(null)
        setPermissions({})
        loadedUserIdRef.current = null
        return
      }

      // Update session state (needed so supabase-js has fresh tokens for queries).
      setSession(s)

      if (!s?.user) {
        // Session is falsy but it wasn't a SIGNED_OUT event — treat as transient.
        // Do NOT clear staff/permissions. If it's a real signout, SIGNED_OUT will
        // follow and that handler clears state.
        return
      }

      // Token refresh & initial-session re-emission: if we already have this
      // user loaded, just update the session reference and STOP. Do NOT call
      // loadProfile — it would trigger an unnecessary DB round-trip which can
      // time out mid-chat and flash the spinner.
      if (event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
        if (loadedUserIdRef.current === s.user.id) return
        // First time we're seeing this user via an auth event — load profile.
        await loadProfile(s.user.id)
        return
      }

      // SIGNED_IN / USER_UPDATED: re-fetch only if user actually changed
      // or explicitly forced by USER_UPDATED.
      const userChanged = loadedUserIdRef.current !== s.user.id
      const force = event === 'USER_UPDATED'
      if (userChanged || force) {
        await loadProfile(s.user.id, { force })
      }
    })

    return () => {
      clearTimeout(timeout)
      subscription.unsubscribe()
    }
  }, [])

  async function signIn(email, password) {
    if (!supabase) throw new Error('Supabase not configured')
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error

    // Set session IMMEDIATELY so ProtectedRoute sees it when LoginPage navigates.
    // Load profile in background — UI updates reactively when state changes.
    if (data.session) {
      setSession(data.session)
      if (data.session.user) {
        loadProfile(data.session.user.id)
      }
    }

    return data
  }

  async function signOut() {
    if (!supabase) return
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    setSession(null)
    setStaff(null)
    setPermissions({})
  }

  function hasPermission(key) {
    // Case-insensitive founder check — DB values like 'Founder' / 'FOUNDER'
    // all count as full-access. Anything else falls through to the
    // per-permission toggles in role_permissions.
    const normalizedRole = staff?.role?.toLowerCase?.()
    if (normalizedRole === 'founder') return true

    // Training category keys (training_onboarding, training_trs, etc.) default
    // to OPEN — if there's no explicit row in role_permissions for this key
    // and role, treat the tile as visible. This matches the contract documented
    // in src/lib/trainingPermissions.js: every existing role keeps current
    // behavior on first deploy; admins only need to write rows when they want
    // to DENY a specific category. An explicit `false` row still denies.
    if (key && key.startsWith('training_')) {
      return permissions[key] !== false
    }

    // Every other permission key uses standard "deny by default" semantics —
    // a missing row means no access.
    return permissions[key] === true
  }

  const value = {
    session,
    user: session?.user ?? null,
    staff,
    role: staff?.role ?? null,
    permissions,
    loading,
    signIn,
    signOut,
    hasPermission,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}

export default AuthContext
