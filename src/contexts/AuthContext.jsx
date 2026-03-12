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

      const { data: perms, error: permsErr } = await supabase
        .from('role_permissions')
        .select('permission_key, enabled')
        .eq('role', staffRow.role)

      if (permsErr) {
        console.error('Error fetching permissions:', permsErr)
        setPermissions({})
        return
      }

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
