import { z } from 'zod'
import type { Cliente } from '@/types/models'
import { formatEmail, formatName, formatPhone, formatRIF } from '@/lib/formatters'

export const clienteSchema = z.object({
  razon_social: z
    .string()
    .min(1, 'La razón social es obligatoria')
    .max(150, 'Máximo 150 caracteres')
    .transform((val) => formatName(val)),
  nombre_comercial: z
    .string()
    .min(1, 'El nombre comercial es obligatorio')
    .max(150, 'Máximo 150 caracteres')
    .transform((val) => formatName(val)),
  identificacion_fiscal: z
    .string()
    .min(1, 'La identificación fiscal es obligatoria')
    .max(30, 'Máximo 30 caracteres')
    .transform((val) => formatRIF(val)),
  correo: z
    .string()
    .min(1, 'El correo es obligatorio')
    .email('Ingresa un correo válido')
    .max(254)
    .transform((val) => formatEmail(val)),
  telefono: z
    .string()
    .min(1, 'El teléfono es obligatorio')
    .max(30, 'Máximo 30 caracteres')
    .transform((val) => formatPhone(val)),
  direccion: z
    .string()
    .min(1, 'La dirección es obligatoria')
    .transform((val) => val.trim()),
  limite_credito: z
    .number({ invalid_type_error: 'Ingresa un monto válido' })
    .finite('Ingresa un monto válido')
    .min(0, 'No puede ser un valor negativo')
    .nullable(),
  dias_credito: z
    .number({ invalid_type_error: 'Ingresa un número válido' })
    .int('Debe ser un número entero')
    .min(0, 'No puede ser un valor negativo')
    .nullable(),
})

export type ClienteFormValues = z.infer<typeof clienteSchema>

/** Payload enviado al backend: el decimal se serializa como string para preservar precisión. */
export type ClientePayload = Omit<ClienteFormValues, 'limite_credito'> & {
  limite_credito: string | null
}

export const CLIENTE_DEFAULT_VALUES: ClienteFormValues = {
  razon_social: '',
  nombre_comercial: '',
  identificacion_fiscal: '',
  correo: '',
  telefono: '',
  direccion: '',
  limite_credito: null,
  dias_credito: null,
}

export function toClienteFormValues(cliente: Cliente): ClienteFormValues {
  return {
    razon_social: cliente.razon_social,
    nombre_comercial: cliente.nombre_comercial,
    identificacion_fiscal: cliente.identificacion_fiscal,
    correo: cliente.correo,
    telefono: cliente.telefono,
    direccion: cliente.direccion,
    limite_credito: cliente.limite_credito != null ? Number(cliente.limite_credito) : null,
    dias_credito: cliente.dias_credito ?? null,
  }
}

export function toClientePayload(values: ClienteFormValues): ClientePayload {
  return {
    ...values,
    limite_credito: values.limite_credito !== null ? String(values.limite_credito) : null,
  }
}
