import { useEffect, useRef, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { ShieldOff, RotateCcw } from 'lucide-react'

/**
 * ProtectedRoute — gates children behind authentication and optional permission.
 *
 * ANTI-FLASH DESIGN:
 * Once we've successfully rendered children (session + staff both present),
 * we never flash the "Loading profile..." or "Loading..." spinners again —
 * even if auth state transiently wobbles (which can happen when Supabase
 * fires TOKEN_REFRESHED during DB queries). A `hasEverLoadedRef` remembers
 * "we were authenticated at least once in this mount" and short-circuits
 * spinner rendering after that point.
 *
 * The only state that still unmounts children is a genuine SIGNED_OUT
 * (session definitively null), which redirects to /login.
 *
 * The old 5-second `window.location.reload()` watchdog was REMOVED — it
 * masked the underlying bug (profile re-fetches on every auth event) and
 * triggered a full-page refresh that wiped React state mid-conversation.
 * With the AuthContext fix (never null-clobber staff on transient events),
 * the watchdog is no longer necessary.
 */
export default function ProtectedRoute({ children, requiredPermission }) {
  const { session, staff, loading, hasPermission } = useAuth()

  // Once true, we consider the app "hydrated" and never show a full-screen
  // spinner again for the rest of this mount.
  const hasEverLoadedRef = useRef(false)
  // Track if we should show a stuck-spinner retry button on true initial load.
  const [showStuckFallback, setShowStuckFallback] = useState(false)

  useEffect(() => {
    if (session && staff) {
      hasEverLoadedRef.current = true
      setShowStuckFallback(false)
    }
  }, [session, staff])

  // Soft 10-second fallback on initial load ONLY. If we still have no
  // session/staff after 10 seconds AND have never loaded, show a reload
  // button so the user has an escape hatch. Does NOT auto-reload.
  useEffect(() => {
    if (hasEverLoadedRef.current) return
    if (!loading && session && staff) return
    const t = setTimeout(() => {
      if (!hasEverLoadedRef.current) setShowStuckFallback(true)
    }, 10000)
    return () => clearTimeout(t)
  }, [loading, session, staff])

  const renderSpinner = (message) => (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-sm px-4">
        {showStuckFallback ? (
          <>
            <div className="text-3xl mb-3">⏱️</div>
            <p className="text-sm text-gray-600 mb-1 font-medium">Still loading…</p>
            <p className="text-xs text-gray-400 mb-4">
              Something took longer than expected. Try reloading.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition"
            >
              <RotateCcw className="w-4 h-4" />
              Reload
            </button>
          </>
        ) : (
          <>
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-gray-400">{message}</p>
          </>
        )}
      </div>
    </div>
  )

  // ─── Once hydrated, always show children ─────────────────────────────────
  // If we've ever had a successful (session + staff) state, we commit to
  // rendering children. Transient auth wobbles do NOT unmount them. The only
  // exception is if session becomes definitively null (SIGNED_OUT handled
  // in AuthContext), in which case we redirect below.
  if (hasEverLoadedRef.current) {
    if (!session) return <Navigate to="/login" replace />
    if (requiredPermission && !hasPermission(requiredPermission)) {
      return <AccessDenied />
    }
    return children
  }

  // ─── Initial-load gating (only happens once per mount) ───────────────────
  if (loading) return renderSpinner('Loading...')
  if (!session) return <Navigate to="/login" replace />
  if (!staff) return renderSpinner('Loading profile...')
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <AccessDenied />
  }
  return children
}

function AccessDenied() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center max-w-md">
        <ShieldOff className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-sm text-gray-500">
          You don't have permission to view this page. Contact your administrator
          if you believe this is an error.
        </p>
      </div>
    </div>
  )
}
