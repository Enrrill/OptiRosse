import type { RolUsuario } from '@/types/models'

const ROLES_DOCUMENTOS = new Set<RolUsuario>(['administrador', 'empleado'])

/** Roles con permiso para generar documentos (espejo de `PuedeGenerarDocumento`). */
export function puedeGenerarDocumentos(rol?: RolUsuario | null): boolean {
  return !!rol && ROLES_DOCUMENTOS.has(rol)
}