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

export function getNavTitle(pathname: string): string {
  const match = NAV_ITEMS.find(
    (item) => item.to !== '/' && pathname.startsWith(item.to),
  )
  return match?.label ?? 'Dashboard'
}
