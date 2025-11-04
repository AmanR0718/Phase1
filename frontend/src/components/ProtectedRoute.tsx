import { Navigate } from 'react-router-dom'
import useAuthStore from '@/store/authStore'

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { token, isLoading } = useAuthStore()

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!token) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
