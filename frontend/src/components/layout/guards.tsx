import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuthStore } from '@/store/useAuth'
import type { RolUsuario } from '@/types/models'

export function ProtectedRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }
  return <Outlet />
}

export function PublicOnlyRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }
  return <Outlet />
}

export function RoleRoute({ roles }: { roles: RolUsuario[] }) {
  const user = useAuthStore((s) => s.user)

  if (!user || !roles.includes(user.rol)) {
    return <Navigate to="/" replace />
  }
  return <Outlet />
}
