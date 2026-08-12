import { useApiMutation } from '@/hooks/useApi'
import { CATEGORIAS, detalle } from '@/lib/api/endpoints'
import type { Categoria } from '@/types/models'
import type { CategoriaPayload } from '../components/categoriaSchema'

const INVALIDATES: unknown[][] = [['categorias'], ['productos'], ['dashboard', 'resumen']]

export function useCrearCategoria() {
  return useApiMutation<Categoria, CategoriaPayload>({
    url: CATEGORIAS,
    method: 'post',
    invalidates: INVALIDATES,
    successMessage: 'Categoría creada correctamente',
  })
}

export function useActualizarCategoria(id: number | null) {
  return useApiMutation<Categoria, CategoriaPayload>({
    url: id ? detalle(CATEGORIAS, id) : '',
    method: 'patch',
    invalidates: INVALIDATES,
    successMessage: 'Categoría actualizada correctamente',
  })
}

export function useDesactivarCategoria(id: number | null) {
  return useApiMutation<null, void>({
    url: id ? detalle(CATEGORIAS, id) : '',
    method: 'delete',
    invalidates: INVALIDATES,
    successMessage: 'Categoría desactivada correctamente',
  })
}

export function useReactivarCategoria(id: number | null) {
  return useApiMutation<Categoria, { activo: boolean }>({
    url: id ? detalle(CATEGORIAS, id) : '',
    method: 'patch',
    invalidates: INVALIDATES,
    successMessage: 'Categoría reactivada correctamente',
  })
}