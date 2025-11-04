import { Navigate } from 'react-router-dom'
import useAuthStore from '@/store/authStore'

interface RoleRouteProps {
  children: React.ReactNode
  requiredRole: string | string[]
}

export const RoleRoute = ({ children, requiredRole }: RoleRouteProps) => {
  const { user } = useAuthStore()

  // Convert to array if single role
  const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]

  // Check if user has one of the required roles
  const hasRole = user?.roles?.some((role: string) => 
    allowedRoles.map(r => r.toUpperCase()).includes(role.toUpperCase())
  )

  if (!hasRole) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
