import { Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import LoadingState from '../ui/LoadingState'

export default function RoleGuard({ role, children }) {
  const { role: userRole, loading } = useAuth()

  if (loading)          return <LoadingState />
  if (userRole !== role) return <Navigate to="/unauthorized" replace />

  return children
}
