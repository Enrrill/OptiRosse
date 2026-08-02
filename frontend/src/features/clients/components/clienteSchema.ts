import { z } from 'zod'
import type { Cliente } from '@/types/models'

export const clienteSchema = z.object({
  razon_social: z.string().min(1, 'La razón social es obligatoria').max(150, 'Máximo 150 caracteres'),
  nombre_comercial: z
    .string()
    .min(1, 'El nombre comercial es obligatorio')
    .max(150, 'Máximo 150 caracteres'),
  identificacion_fiscal: z
    .string()
    .min(1, 'La identificación fiscal es obligatoria')
    .max(30, 'Máximo 30 caracteres'),
  correo: z.string().min(1, 'El correo es obligatorio').email('Ingresa un correo válido').max(254),
  telefono: z.string().min(1, 'El teléfono es obligatorio').max(30, 'Máximo 30 caracteres'),
  direccion: z.string().min(1, 'La dirección es obligatoria'),
  limite_credito: z
    .number('Ingresa un monto válido')
    .finite('Ingresa un monto válido')
    .min(0, 'No puede ser un valor negativo'),
  dias_credito: z
    .number('Ingresa un número válido')
    .int('Debe ser un número entero')
    .min(0, 'No puede ser un valor negativo'),
})

export type ClienteFormValues = z.infer<typeof clienteSchema>

/** Payload enviado al backend: el decimal se serializa como string para preservar precisión. */
export type ClientePayload = Omit<ClienteFormValues, 'limite_credito'> & { limite_credito: string }

export const CLIENTE_DEFAULT_VALUES: ClienteFormValues = {
  razon_social: '',
  nombre_comercial: '',
  identificacion_fiscal: '',
  correo: '',
  telefono: '',
  direccion: '',
  limite_credito: 0,
  dias_credito: 0,
}

export function toClienteFormValues(cliente: Cliente): ClienteFormValues {
  return {
    razon_social: cliente.razon_social,
    nombre_comercial: cliente.nombre_comercial,
    identificacion_fiscal: cliente.identificacion_fiscal,
    correo: cliente.correo,
    telefono: cliente.telefono,
    direccion: cliente.direccion,
    limite_credito: Number(cliente.limite_credito),
    dias_credito: cliente.dias_credito,
  }
}

export function toClientePayload(values: ClienteFormValues): ClientePayload {
  return {
    ...values,
    limite_credito: String(values.limite_credito),
  }
}
