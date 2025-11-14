// frontend/src/components/RoleRoute.tsx
import { Navigate } from 'react-router-dom'
import useAuthStore from '@/store/authStore'

interface RoleRouteProps {
  children: React.ReactNode
  requiredRole: string | string[]
}

export function RoleRoute({ children, requiredRole }: RoleRouteProps) {
  const { user } = useAuthStore()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  const userRole = user.roles?.[0]?.toLowerCase()
  const allowedRoles = Array.isArray(requiredRole) 
    ? requiredRole.map(r => r.toLowerCase()) 
    : [requiredRole.toLowerCase()]

  if (!allowedRoles.includes(userRole)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-50">
        <div className="text-center p-8">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-3xl font-bold text-red-600 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-6">You don't have permission to access this page.</p>
          <button
            onClick={() => window.history.back()}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
