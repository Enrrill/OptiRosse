import type { RolUsuario } from '@/types/models'

export const RECETA_WRITE_ROLES: RolUsuario[] = ['administrador', 'empleado']

export function puedeEditarRecetas(rol?: RolUsuario | null): boolean {
  if (!rol) return false
  return RECETA_WRITE_ROLES.includes(rol)
}
