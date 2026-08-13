/* eslint-disable react-refresh/only-export-components */
import { lazy, Suspense } from 'react'
import { createBrowserRouter } from 'react-router'
import { AppShell } from '@/components/layout/AppShell'
import { FullPageLoader } from '@/components/layout/FullPageLoader'
import { ProtectedRoute, PublicOnlyRoute, RoleRoute } from '@/components/layout/guards'
import type { RolUsuario } from '@/types/models'

const Login = lazy(() => import('@/features/auth/pages/LoginPage'))
const Dashboard = lazy(() => import('@/features/dashboard/pages/DashboardPage'))
const Perfil = lazy(() => import('@/features/profile/pages/PerfilPage'))
const Clientes = lazy(() => import('@/features/clients/pages/ClientesPage'))
const ClienteDetalle = lazy(() => import('@/features/clients/pages/ClienteDetallePage'))
const Usuarios = lazy(() => import('@/features/users/pages/UsuariosPage'))
const Inventario = lazy(() => import('@/features/inventory/pages/InventarioPage'))
const Recetas = lazy(() => import('@/features/prescriptions/pages/RecetasPage'))
const Pedidos = lazy(() => import('@/features/orders/pages/PedidosPage'))
const Finanzas = lazy(() => import('@/features/finance/pages/FinanzasPage'))
const Documentos = lazy(() => import('@/features/documents/pages/DocumentosPage'))
const NotFound = lazy(() => import('@/features/errors/NotFoundPage'))
const Forbidden = lazy(() => import('@/features/errors/ForbiddenPage'))

const withSuspense = (element: React.ReactNode) => (
  <Suspense fallback={<FullPageLoader />}>{element}</Suspense>
)

const adminOnly: RolUsuario[] = ['administrador']
const adminAlmacen: RolUsuario[] = ['administrador', 'almacen']
const adminContabilidad: RolUsuario[] = ['administrador', 'contabilidad']
const adminContabilidadVendedor: RolUsuario[] = [
  'administrador',
  'contabilidad',
  'vendedor_b2b',
]

const dashboard = withSuspense(<Dashboard />)

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <PublicOnlyRoute />,
    children: [{ index: true, element: withSuspense(<Login />) }],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppShell />,
        children: [
          { path: '/', element: dashboard },
          { path: '/perfil', element: withSuspense(<Perfil />) },
          { path: '/clientes', element: withSuspense(<Clientes />) },
          { path: '/clientes/:id', element: withSuspense(<ClienteDetalle />) },
          { path: '/usuarios', element: <RoleRoute roles={adminOnly} />, children: [{ index: true, element: withSuspense(<Usuarios />) }] },
          { path: '/inventario', element: <RoleRoute roles={adminAlmacen} />, children: [{ index: true, element: withSuspense(<Inventario />) }] },
          { path: '/recetas', element: withSuspense(<Recetas />) },
          { path: '/pedidos', element: <RoleRoute roles={adminContabilidadVendedor} />, children: [{ index: true, element: withSuspense(<Pedidos />) }] },
          { path: '/finanzas', element: <RoleRoute roles={adminContabilidad} />, children: [{ index: true, element: withSuspense(<Finanzas />) }] },
          { path: '/documentos', element: <RoleRoute roles={adminContabilidadVendedor} />, children: [{ index: true, element: withSuspense(<Documentos />) }] },
          { path: '/403', element: withSuspense(<Forbidden />) },
        ],
      },
    ],
  },
  { path: '*', element: withSuspense(<NotFound />) },
])


