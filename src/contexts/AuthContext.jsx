import { createContext, useContext, useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [staff, setStaff] = useState(null)
  const [permissions, setPermissions] = useState({})
  const [loading, setLoading] = useState(true)
  const loadingResolved = useRef(false)

  function finishLoading() {
    if (!loadingResolved.current) {
      loadingResolved.current = true
      setLoading(false)
    }
  }

  // Fetch staff profile + permissions for logged-in user
  async function loadProfile(userId) {
    if (!supabase || !userId) {
      setStaff(null)
      setPermissions({})
      return
    }

    try {
      // Fetch staff record linked to this auth user
      const { data: staffRow, error: staffErr } = await supabase
        .from('staff')
        .select('*')
        .eq('auth_user_id', userId)
        .single()

      if (staffErr || !staffRow) {
        console.error('No staff profile found for auth user:', staffErr)
        setStaff(null)
        setPermissions({})
        return
      }

      setStaff(staffRow)

      // Fetch role permissions
      const { data: perms, error: permsErr } = await supabase
        .from('role_permissions')
        .select('permission_key, enabled')
        .eq('role', staffRow.role)

      if (permsErr) {
        console.error('Error fetching permissions:', permsErr)
        setPermissions({})
        return
      }

      // Convert to { permission_key: boolean } map
      const permMap = {}
      perms?.forEach((p) => {
        permMap[p.permission_key] = p.enabled
      })
      setPermissions(permMap)
    } catch (err) {
      console.error('Error loading profile:', err)
      setStaff(null)
      setPermissions({})
    }
  }

  // Listen for auth changes
  useEffect(() => {
    if (!supabase) {
      finishLoading()
      return
    }

    // Safety timeout — if auth check takes longer than 10 seconds, stop loading.
    // This is a non-destructive safety net: it just finishes loading so the user
    // sees the login page instead of an infinite spinner. We do NOT clear tokens
    // because that can corrupt the Supabase client's internal state.
    const timeout = setTimeout(() => {
      if (!loadingResolved.current) {
        console.warn('Auth loading timeout — finishing loading (non-destructive)')
        finishLoading()
      }
    }, 10000)

    // Get initial session — wrapped in a race with a 5-second fallback
    // because getSession() can hang due to navigator.locks issues
    const getSessionWithTimeout = Promise.race([
      supabase.auth.getSession(),
      new Promise((resolve) =>
        setTimeout(() => resolve({ data: { session: null } }), 5000)
      ),
    ])

    getSessionWithTimeout
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

    // Subscribe to auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, s) => {
      setSession(s)
      if (s?.user) {
        await loadProfile(s.user.id)
      } else {
        setStaff(null)
        setPermissions({})
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
    // Load profile in the background — don't await it to avoid hanging if the
    // Supabase client's REST queries are slow.
    if (data.session) {
      setSession(data.session)
      if (data.session.user) {
        // Fire-and-forget: profile loads in background, UI updates reactively
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
    // Founder always has access to everything
    if (staff?.role === 'founder') return true
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
