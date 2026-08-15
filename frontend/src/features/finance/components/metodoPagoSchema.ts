import { z } from 'zod'
import type { MetodoPago } from '@/types/models'

export const MONEDAS = ['USD', 'VES', 'EUR'] as const

export const metodoPagoSchema = z.object({
  nombre: z.string().trim().min(1, 'El nombre es obligatorio').max(50, 'Máximo 50 caracteres'),
  moneda: z.string().trim().min(1, 'La moneda es obligatoria').max(10, 'Máximo 10 caracteres'),
  requiere_referencia: z.boolean(),
})

export type MetodoPagoFormValues = z.infer<typeof metodoPagoSchema>

export const METODO_PAGO_DEFAULT_VALUES: MetodoPagoFormValues = {
  nombre: '',
  moneda: 'USD',
  requiere_referencia: true,
}

export function toMetodoPagoFormValues(metodo: MetodoPago): MetodoPagoFormValues {
  return {
    nombre: metodo.nombre,
    moneda: metodo.moneda,
    requiere_referencia: metodo.requiere_referencia,
  }
}