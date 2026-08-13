import type { RolUsuario } from '@/types/models'

export const RECETA_WRITE_ROLES: RolUsuario[] = ['administrador', 'tecnico_taller', 'vendedor_b2b']

export function puedeEditarRecetas(rol?: RolUsuario | null): boolean {
  if (!rol) return false
  return RECETA_WRITE_ROLES.includes(rol)
}
