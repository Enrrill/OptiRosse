import type { RolUsuario } from '@/types/models'

export interface NavItem {
  to: string
  label: string
  icon: string
  /** Roles con acceso (undefined = todos los autenticados). */
  roles?: RolUsuario[]
  end?: boolean
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: 'dashboard', end: true },
  { to: '/clientes', label: 'Clientes', icon: 'groups' },
  { to: '/inventario', label: 'Inventario', icon: 'inventory_2' },
  { to: '/recetas', label: 'Recetas', icon: 'description' },
  { to: '/pedidos', label: 'Pedidos', icon: 'shopping_cart' },
  { to: '/finanzas', label: 'Finanzas', icon: 'payments', roles: ['administrador', 'contabilidad'] },
  { to: '/documentos', label: 'Documentos', icon: 'folder_shared', roles: ['administrador', 'contabilidad', 'vendedor_b2b'] },
  { to: '/auditoria', label: 'Auditoría', icon: 'history', roles: ['administrador'] },
  { to: '/usuarios', label: 'Usuarios', icon: 'manage_accounts', roles: ['administrador'] },
]

export function navItemsForRole(rol?: RolUsuario | null): NavItem[] {
  if (!rol) return []
  return NAV_ITEMS.filter((item) => !item.roles || item.roles.includes(rol))
}

export interface BreadcrumbSegment {
  label: string
  /** Si se omite, es el segmento activo (último). */
  to?: string
}

/**
 * Devuelve los segmentos del breadcrumb para el Topbar.
 * El último segmento es siempre la sección activa (sin link).
 * Siempre incluye "OptiRosse" como raíz.
 */
export function getNavBreadcrumb(pathname: string): BreadcrumbSegment[] {
  const root: BreadcrumbSegment = { label: 'OptiRosse', to: '/' }

  // Rutas especiales con subnivel
  if (pathname.startsWith('/perfil')) {
    return [root, { label: 'Perfil' }]
  }
  if (pathname.startsWith('/pedidos/nuevo')) {
    return [root, { label: 'Pedidos', to: '/pedidos' }, { label: 'Nuevo pedido' }]
  }
  if (/^\/pedidos\/\d+/.test(pathname)) {
    return [root, { label: 'Pedidos', to: '/pedidos' }, { label: 'Detalle' }]
  }
  if (/^\/clientes\/\d+/.test(pathname)) {
    return [root, { label: 'Clientes', to: '/clientes' }, { label: 'Detalle' }]
  }

  // Rutas principales registradas en la nav
  const match = NAV_ITEMS.find(
    (item) => item.to !== '/' && pathname.startsWith(item.to),
  )
  if (match) {
    return [root, { label: match.label }]
  }

  // Ruta raíz (Dashboard)
  return [root]
}
