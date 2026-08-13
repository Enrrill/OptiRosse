import { useApiMutation } from '@/hooks/useApi'
import { RECETAS, detalle } from '@/lib/api/endpoints'
import type { RecetaOptica } from '@/types/models'
import type { RecetaPayload } from '../components/recetaSchema'

export function useCrearReceta() {
  return useApiMutation<RecetaOptica, RecetaPayload>({
    url: RECETAS,
    method: 'post',
    invalidates: [['recetas']],
    successMessage: 'Receta creada correctamente',
  })
}

export function useActualizarReceta(id: number | null) {
  return useApiMutation<RecetaOptica, Partial<RecetaPayload>>({
    url: id ? detalle(RECETAS, id) : '',
    method: 'patch',
    invalidates: [['recetas']],
    successMessage: 'Receta actualizada correctamente',
  })
}

export function useDesactivarReceta(id: number | null) {
  return useApiMutation<null, void>({
    url: id ? detalle(RECETAS, id) : '',
    method: 'delete',
    invalidates: [['recetas']],
    successMessage: 'Receta desactivada correctamente',
  })
}

export function useReactivarReceta(id: number | null) {
  return useApiMutation<RecetaOptica, { activo: boolean }>({
    url: id ? detalle(RECETAS, id) : '',
    method: 'patch',
    invalidates: [['recetas']],
    successMessage: 'Receta reactivada correctamente',
  })
}