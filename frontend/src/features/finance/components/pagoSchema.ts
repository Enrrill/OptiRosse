import { z } from 'zod'
import type { PagoPayload } from '@/types/models'

export const clienteSeleccion = z.object({
  id: z.number(),
  nombre_comercial: z.string(),
  razon_social: z.string(),
})

export const pedidoSeleccion = z.object({
  id: z.number(),
  numero_pedido: z.string(),
  total: z.string(),
  cliente_detalle: clienteSeleccion,
})

export const metodoPagoSeleccion = z.object({
  id: z.number(),
  nombre: z.string(),
  moneda: z.string().optional(),
  requiere_referencia: z.boolean().optional(),
})

export const pagoSchema = z
  .object({
    cliente: clienteSeleccion
      .nullable()
      .refine((v) => v !== null, { message: 'Selecciona un cliente' }),
    pedido: pedidoSeleccion.nullable(),
    metodo_pago: metodoPagoSeleccion
      .nullable()
      .refine((v) => v !== null, { message: 'Selecciona un método de pago' }),
    monto: z
      .number('Ingresa un monto válido')
      .finite('Ingresa un monto válido')
      .refine((v) => v > 0, { message: 'El monto debe ser mayor a cero' }),
    tasa_cambio: z
      .number('Ingresa un valor válido')
      .finite('Ingresa un valor válido')
      .refine((v) => v > 0, { message: 'La tasa de cambio debe ser mayor a cero' }),
    numero_referencia: z.string().trim(),
    fecha_pago: z.string(),
    comprobante_imagen_url: z.string().trim(),
  })
  .superRefine((data, ctx) => {
    if (data.metodo_pago?.requiere_referencia && !data.numero_referencia) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['numero_referencia'],
        message: 'Este método de pago requiere número de referencia',
      })
    }
  })

export type PagoFormValues = z.infer<typeof pagoSchema>

export const PAGO_DEFAULT_VALUES: PagoFormValues = {
  cliente: null,
  pedido: null,
  metodo_pago: null,
  monto: 0,
  tasa_cambio: 1,
  numero_referencia: '',
  fecha_pago: '',
  comprobante_imagen_url: '',
}

export function toPagoPayload(values: PagoFormValues): PagoPayload {
  const payload: PagoPayload = {
    cliente: values.cliente!.id,
    metodo_pago: values.metodo_pago!.id,
    monto: values.monto,
    tasa_cambio: values.tasa_cambio,
  }
  if (values.pedido != null) payload.pedido = values.pedido.id
  if (values.numero_referencia) payload.numero_referencia = values.numero_referencia
  if (values.fecha_pago) payload.fecha_pago = new Date(values.fecha_pago).toISOString()
  if (values.comprobante_imagen_url) {
    payload.comprobante_imagen_url = values.comprobante_imagen_url
  }
  return payload
}