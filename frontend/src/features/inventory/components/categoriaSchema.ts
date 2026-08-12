import { z } from 'zod'
import type { Categoria, TipoProducto } from '@/types/models'

export const TIPOS_PRODUCTO: TipoProducto[] = [
  'montura',
  'cristal_terminado',
  'bloque_tallado',
  'accesorio',
]

export const categoriaSchema = z.object({
  nombre: z.string().trim().min(1, 'El nombre es obligatorio').max(100, 'Máximo 100 caracteres'),
  tipo_producto: z.enum(TIPOS_PRODUCTO),
})

export type CategoriaFormValues = z.infer<typeof categoriaSchema>
export type CategoriaPayload = CategoriaFormValues

export const CATEGORIA_DEFAULT_VALUES: CategoriaFormValues = {
  nombre: '',
  tipo_producto: 'montura',
}

export function toCategoriaFormValues(categoria: Categoria): CategoriaFormValues {
  return {
    nombre: categoria.nombre,
    tipo_producto: categoria.tipo_producto,
  }
}