import { z } from 'zod'
import type { Producto, VarianteProducto } from '@/types/models'

const opticoNullable = z
  .number('Ingresa un valor válido')
  .finite('Ingresa un valor válido')
  .nullable()

export const varianteRowSchema = z.object({
  id: z.number().int().optional(),
  sku: z
    .string()
    .trim()
    .min(1, 'El SKU es obligatorio')
    .max(100, 'Máximo 100 caracteres'),
  codigo_barras: z.string().trim().max(100, 'Máximo 100 caracteres').optional(),
  color: z.string().trim().max(50, 'Máximo 50 caracteres').optional(),
  tamano: z.string().trim().max(50, 'Máximo 50 caracteres').optional(),
  esfera: opticoNullable.refine((v) => v === null || (v >= -30 && v <= 30), {
    message: 'Debe estar entre -30 y 30',
  }),
  cilindro: opticoNullable.refine((v) => v === null || (v >= -30 && v <= 30), {
    message: 'Debe estar entre -30 y 30',
  }),
  eje: z
    .number('Ingresa un valor válido')
    .int('Debe ser un número entero')
    .nullable()
    .refine((v) => v === null || (v >= 0 && v <= 180), { message: 'Debe estar entre 0 y 180' }),
  adicion: opticoNullable.refine((v) => v === null || v >= 0, {
    message: 'No puede ser un valor negativo',
  }),
  stock: z
    .number('Ingresa un número válido')
    .int('Debe ser un número entero')
    .min(0, 'No puede ser un valor negativo'),
  alerta_stock_minimo: z
    .number('Ingresa un número válido')
    .int('Debe ser un número entero')
    .min(0, 'No puede ser un valor negativo'),
  precio_al_mayor: z
    .number('Ingresa un monto válido')
    .finite('Ingresa un monto válido')
    .min(0, 'No puede ser un valor negativo'),
  precio_costo: z
    .number('Ingresa un monto válido')
    .finite('Ingresa un monto válido')
    .min(0, 'No puede ser un valor negativo'),
})

export const productoSchema = z
  .object({
    marca: z.string().trim().min(1, 'La marca es obligatoria').max(100, 'Máximo 100 caracteres'),
    codigo_modelo: z
      .string()
      .trim()
      .min(1, 'El código del modelo es obligatorio')
      .max(100, 'Máximo 100 caracteres'),
    descripcion: z.string().trim().optional(),
    categoria: z.number('Selecciona una categoría').int().min(1, 'Selecciona una categoría'),
    indice_refraccion: z.string().trim().max(10, 'Máximo 10 caracteres').optional(),
    material: z.string().trim().max(50, 'Máximo 50 caracteres').optional(),
    tratamiento: z.string().trim().max(50, 'Máximo 50 caracteres').optional(),
    diseno: z.string().trim().max(50, 'Máximo 50 caracteres').optional(),
    variantes: z.array(varianteRowSchema),
  })
  .superRefine((rows, ctx) => {
    const skuMap = new Map<string, number>()
    const barraMap = new Map<string, number>()

    rows.variantes.forEach((row, index) => {
      const sku = row.sku.trim().toLowerCase()
      if (sku) {
        if (skuMap.has(sku)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['variantes', index, 'sku'],
            message: 'El SKU está duplicado en este producto',
          })
        }
        skuMap.set(sku, index)
      }

      const barra = (row.codigo_barras ?? '').trim().toLowerCase()
      if (barra) {
        if (barraMap.has(barra)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['variantes', index, 'codigo_barras'],
            message: 'El código de barras está duplicado en este producto',
          })
        }
        barraMap.set(barra, index)
      }
    })
  })

export type VarianteRowFormValues = z.infer<typeof varianteRowSchema>
export type ProductoFormValues = z.infer<typeof productoSchema>

export interface VariantePayload {
  id?: number
  sku: string
  codigo_barras: string | null
  color: string
  tamano: string
  esfera: number | null
  cilindro: number | null
  eje: number | null
  adicion: number | null
  stock: number
  alerta_stock_minimo: number
  precio_al_mayor: string
  precio_costo: string
}

export type ProductoPayload = Omit<ProductoFormValues, 'variantes'> & {
  variantes: VariantePayload[]
}

export const PRODUCTO_DEFAULT_VALUES: ProductoFormValues = {
  marca: '',
  codigo_modelo: '',
  descripcion: '',
  categoria: 0,
  indice_refraccion: '',
  material: '',
  tratamiento: '',
  diseno: '',
  variantes: [DEFAULT_VARIANTE_ROW()],
}

export function DEFAULT_VARIANTE_ROW(): VarianteRowFormValues {
  return {
    sku: '',
    codigo_barras: '',
    color: '',
    tamano: '',
    esfera: null,
    cilindro: null,
    eje: null,
    adicion: null,
    stock: 0,
    alerta_stock_minimo: 5,
    precio_al_mayor: 0,
    precio_costo: 0,
  }
}

export function toProductoFormValues(producto: Producto): ProductoFormValues {
  return {
    marca: producto.marca,
    codigo_modelo: producto.codigo_modelo,
    descripcion: producto.descripcion,
    categoria: producto.categoria,
    indice_refraccion: producto.indice_refraccion,
    material: producto.material,
    tratamiento: producto.tratamiento,
    diseno: producto.diseno,
    variantes: producto.variantes.map(toVarianteRowFormValues),
  }
}

export function toVarianteRowFormValues(variante: VarianteProducto): VarianteRowFormValues {
  return {
    id: variante.id,
    sku: variante.sku,
    codigo_barras: variante.codigo_barras ?? '',
    color: variante.color ?? '',
    tamano: variante.tamano ?? '',
    esfera: variante.esfera !== null ? Number(variante.esfera) : null,
    cilindro: variante.cilindro !== null ? Number(variante.cilindro) : null,
    eje: variante.eje,
    adicion: variante.adicion !== null ? Number(variante.adicion) : null,
    stock: variante.stock,
    alerta_stock_minimo: variante.alerta_stock_minimo,
    precio_al_mayor: Number(variante.precio_al_mayor),
    precio_costo: Number(variante.precio_costo),
  }
}

export function toVariantePayload(values: VarianteRowFormValues): VariantePayload {
  return {
    ...(values.id !== undefined ? { id: values.id } : {}),
    sku: values.sku.trim(),
    codigo_barras: (values.codigo_barras ?? '').trim() || null,
    color: (values.color ?? '').trim(),
    tamano: (values.tamano ?? '').trim(),
    esfera: values.esfera,
    cilindro: values.cilindro,
    eje: values.eje,
    adicion: values.adicion,
    stock: values.stock,
    alerta_stock_minimo: values.alerta_stock_minimo,
    precio_al_mayor: String(values.precio_al_mayor),
    precio_costo: String(values.precio_costo),
  }
}

export function toProductoPayload(values: ProductoFormValues): ProductoPayload {
  return {
    marca: values.marca,
    codigo_modelo: values.codigo_modelo,
    descripcion: values.descripcion ?? '',
    categoria: values.categoria,
    indice_refraccion: values.indice_refraccion ?? '',
    material: values.material ?? '',
    tratamiento: values.tratamiento ?? '',
    diseno: values.diseno ?? '',
    variantes: values.variantes.map(toVariantePayload),
  }
}