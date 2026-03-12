import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { ShieldOff } from 'lucide-react'

export default function ProtectedRoute({ children, requiredPermission }) {
  const { session, staff, loading, hasPermission } = useAuth()

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  // Not logged in → redirect to login
  if (!session) {
    return <Navigate to="/login" replace />
  }

  // Logged in but no staff profile found → show error
  if (!staff) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <ShieldOff className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Account Not Linked</h2>
          <p className="text-sm text-gray-500">
            Your login is valid but no staff profile is linked to this account.
            Please contact your administrator.
          </p>
        </div>
      </div>
    )
  }

  // Check specific permission if required
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center max-w-md">
          <ShieldOff className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-sm text-gray-500">
            You don't have permission to view this page.
            Contact your administrator if you believe this is an error.
          </p>
        </div>
      </div>
    )
  }

  return children
}
