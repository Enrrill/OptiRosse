import { z } from 'zod'
import type { DetallePedidoPayload, Pedido, PedidoPayload } from '@/types/models'

export const clienteSeleccion = z.object({
  id: z.number(),
  nombre_comercial: z.string(),
  razon_social: z.string(),
})

export const recetaSeleccion = z.object({
  id: z.number(),
  nombre_paciente: z.string(),
})

export const varianteSeleccion = z.object({
  id: z.number(),
  sku: z.string(),
  color: z.string().optional(),
  tamano: z.string().optional(),
  stock: z.number().optional(),
  precio_al_mayor: z.string().optional(),
})

export type ClienteSeleccion = z.infer<typeof clienteSeleccion>
export type RecetaSeleccion = z.infer<typeof recetaSeleccion>
export type VarianteSeleccion = z.infer<typeof varianteSeleccion>

export const pedidoLineaSchema = z.object({
  id: z.number().int().optional(),
  variante: varianteSeleccion
    .nullable()
    .refine((v) => v !== null, { message: 'Selecciona una variante' }),
  cantidad: z
    .number('Ingresa un valor válido')
    .int('Debe ser un número entero')
    .min(1, 'La cantidad debe ser mayor o igual a 1'),
  precio_unitario: z
    .number('Ingresa un monto válido')
    .finite('Ingresa un monto válido')
    .min(0, 'No puede ser un valor negativo'),
})

export const pedidoFormSchema = z
  .object({
    cliente: clienteSeleccion
      .nullable()
      .refine((v) => v !== null, { message: 'Selecciona un cliente' }),
    receta: recetaSeleccion.nullable(),
    notas: z.string().trim(),
    detalles: z.array(pedidoLineaSchema).min(1, 'Agrega al menos una línea'),
  })
  .superRefine((data, ctx) => {
    const ids = data.detalles.map((d) => d.variante?.id).filter((v): v is number => v != null)
    if (new Set(ids).size !== ids.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['detalles'],
        message: 'Hay variantes repetidas en el mismo pedido',
      })
    }
  })

export type PedidoLineaFormValue = z.infer<typeof pedidoLineaSchema>
export type PedidoFormValues = z.infer<typeof pedidoFormSchema>

export const PEDIDO_DEFAULT_VALUES: PedidoFormValues = {
  cliente: null,
  receta: null,
  notas: '',
  detalles: [DEFAULT_PEDIDO_LINEA()],
}

export function DEFAULT_PEDIDO_LINEA(): PedidoLineaFormValue {
  return {
    variante: null,
    cantidad: 1,
    precio_unitario: 0,
  }
}

export function toPedidoFormValues(pedido: Pedido): PedidoFormValues {
  return {
    cliente: pedido.cliente_detalle,
    receta: pedido.receta_detalle
      ? { id: pedido.receta_detalle.id, nombre_paciente: pedido.receta_detalle.nombre_paciente }
      : null,
    notas: pedido.notas,
    detalles: pedido.detalles.map((d) => ({
      id: d.id,
      variante: {
        id: d.variante_detalle.id,
        sku: d.variante_detalle.sku,
        color: d.variante_detalle.color,
        tamano: d.variante_detalle.tamano,
      },
      cantidad: d.cantidad,
      precio_unitario: Number(d.precio_unitario),
    })),
  }
}

export function toPedidoPayload(values: PedidoFormValues): PedidoPayload {
  const detalles: DetallePedidoPayload[] = values.detalles.map((d) => ({
    ...(d.id !== undefined ? { id: d.id } : {}),
    variante: d.variante!.id,
    cantidad: d.cantidad,
    precio_unitario: d.precio_unitario,
  }))

  return {
    cliente: values.cliente!.id,
    receta: values.receta?.id ?? null,
    notas: values.notas,
    detalles,
  }
}
