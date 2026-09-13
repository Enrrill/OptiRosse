import { z } from 'zod'
import type { DetallePedidoPayload, Pedido, PedidoPayload } from '@/types/models'

export const clienteSeleccion = z.object({
  id: z.number(),
  nombre_comercial: z.string(),
  razon_social: z.string(),
})

export const pacienteSeleccion = z.object({
  id: z.number(),
  nombre_completo: z.string(),
})

export const destinatarioSeleccion = z.discriminatedUnion('tipo', [
  z.object({ tipo: z.literal('cliente'), id: z.number(), nombre: z.string() }),
  z.object({ tipo: z.literal('paciente'), id: z.number(), nombre: z.string() }),
])

export const recetaSeleccion = z.object({
  id: z.number(),
  nombre_completo: z.string(),
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
export type PacienteSeleccion = z.infer<typeof pacienteSeleccion>
export type DestinatarioSeleccion = z.infer<typeof destinatarioSeleccion>
export type RecetaSeleccion = z.infer<typeof recetaSeleccion>
export type VarianteSeleccion = z.infer<typeof varianteSeleccion>

export const pedidoLineaSchema = z.object({
  id: z.number().int().optional(),
  variante: varianteSeleccion
    .nullable()
    .refine((v): boolean => v !== null, { message: 'Selecciona una variante' }),
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
    destinatario: destinatarioSeleccion.refine(
      (v): boolean => v !== null && v.id > 0,
      { message: 'Selecciona un cliente o paciente' },
    ),
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
  destinatario: { tipo: 'cliente', id: 0, nombre: '' },
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
  let destinatario: DestinatarioSeleccion
  if (pedido.cliente && pedido.cliente_detalle) {
    destinatario = {
      tipo: 'cliente',
      id: pedido.cliente,
      nombre: pedido.cliente_detalle.nombre_comercial,
    }
  } else if (pedido.paciente && pedido.paciente_detalle) {
    destinatario = {
      tipo: 'paciente',
      id: pedido.paciente,
      nombre: pedido.paciente_detalle.nombre_completo,
    }
  } else {
    destinatario = { tipo: 'cliente', id: 0, nombre: '' }
  }

  return {
    destinatario,
    receta: pedido.receta_detalle
      ? {
          id: pedido.receta_detalle.id,
          nombre_completo: pedido.receta_detalle.paciente_detalle?.nombre_completo ?? `Receta #${pedido.receta_detalle.id}`,
        }
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

  const payload: PedidoPayload = {
    receta: values.receta?.id ?? null,
    notas: values.notas,
    detalles,
  }

  if (values.destinatario?.tipo === 'cliente') {
    payload.cliente = values.destinatario.id
    payload.paciente = null
  } else if (values.destinatario?.tipo === 'paciente') {
    payload.paciente = values.destinatario.id
    payload.cliente = null
  }

  return payload
}
