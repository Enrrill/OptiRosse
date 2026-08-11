import { z } from 'zod'
import type { Usuario } from '@/types/models'

export const ROLES_ARRAY = [
  'administrador',
  'vendedor_b2b',
  'almacen',
  'tecnico_taller',
  'contabilidad',
] as const

export type RolFormValue = (typeof ROLES_ARRAY)[number]

export function usuarioSchemaFactory(esEdicion: boolean) {
  return z
    .object({
      nombre_usuario: z
        .string()
        .min(3, 'El nombre de usuario debe tener al menos 3 caracteres')
        .max(150, 'Máximo 150 caracteres')
        .regex(/^[a-zA-Z0-9_.-]+$/, 'Solo letras, números, punto, guion y guion bajo'),
      correo: z.string().min(1, 'El correo es obligatorio').email('Ingresa un correo válido').max(254),
      nombre: z.string().max(150, 'Máximo 150 caracteres'),
      apellido: z.string().max(150, 'Máximo 150 caracteres'),
      telefono: z.string().max(30, 'Máximo 30 caracteres'),
      rol: z.enum(ROLES_ARRAY),
      password: z.string(),
    })
    .superRefine((values, ctx) => {
      const password = values.password ?? ''
      const vacia = password.length === 0
      if (esEdicion && vacia) return
      if (vacia) {
        ctx.addIssue({ code: 'custom', path: ['password'], message: 'La contraseña es obligatoria' })
        return
      }
      if (password.length < 8) {
        ctx.addIssue({ code: 'custom', path: ['password'], message: 'Mínimo 8 caracteres' })
        return
      }
      if (/^[0-9]+$/.test(password)) {
        ctx.addIssue({ code: 'custom', path: ['password'], message: 'No puede ser solo numérica' })
        return
      }
      if (password.toLowerCase() === values.nombre_usuario.toLowerCase()) {
        ctx.addIssue({
          code: 'custom',
          path: ['password'],
          message: 'No puede ser igual al nombre de usuario',
        })
      }
    })
}

export type UsuarioFormValues = z.infer<ReturnType<typeof usuarioSchemaFactory>>

/** Payload enviado al backend: la contraseña se omite en edición si va vacía. */
export type UsuarioPayload = Omit<UsuarioFormValues, 'password'> & { password?: string }

export const USUARIO_DEFAULT_VALUES: UsuarioFormValues = {
  nombre_usuario: '',
  correo: '',
  nombre: '',
  apellido: '',
  telefono: '',
  rol: 'vendedor_b2b',
  password: '',
}

export function toUsuarioFormValues(usuario: Usuario): UsuarioFormValues {
  return {
    nombre_usuario: usuario.nombre_usuario,
    correo: usuario.correo,
    nombre: usuario.nombre,
    apellido: usuario.apellido,
    telefono: usuario.telefono ?? '',
    rol: usuario.rol,
    password: '',
  }
}

export function toUsuarioPayload(values: UsuarioFormValues, esEdicion: boolean): UsuarioPayload {
  const { password, ...rest } = values
  if (esEdicion && password === '') return rest
  return { ...rest, password }
}
