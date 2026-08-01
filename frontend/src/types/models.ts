export type RolUsuario =
  | 'administrador'
  | 'vendedor_b2b'
  | 'almacen'
  | 'tecnico_taller'
  | 'contabilidad'

export interface Usuario {
  id: number
  nombre_usuario: string
  correo: string
  nombre: string
  apellido: string
  rol: RolUsuario
  telefono: string | null
  activo: boolean
  creado_en: string
  actualizado_en: string
}

export interface TokenResponse {
  access: string
  refresh: string
}
