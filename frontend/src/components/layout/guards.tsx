import { useEffect, useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuthStore } from '@/store/useAuth'
import { apiClient } from '@/lib/api/client'
import { AUTH_ENDPOINTS } from '@/lib/api/endpoints'
import type { ApiResponse } from '@/types/api'
import type { RolUsuario, Usuario } from '@/types/models'
import { FullPageLoader } from '@/components/layout/FullPageLoader'

export function ProtectedRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const location = useLocation()
  const [checking, setChecking] = useState(isAuthenticated)

  useEffect(() => {
    if (!isAuthenticated) return
    let active = true
    apiClient
      .get<ApiResponse<Usuario>>(AUTH_ENDPOINTS.me)
      .then((res) => {
        if (!active) return
        useAuthStore.getState().setUser(res.data.data)
        setChecking(false)
      })
      .catch(() => {
        if (!active) return
        setChecking(false)
      })
    return () => {
      active = false
    }
  }, [isAuthenticated])

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }
  if (checking) {
    return <FullPageLoader />
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
