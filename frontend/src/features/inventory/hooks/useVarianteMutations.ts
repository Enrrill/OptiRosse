import { useApiMutation } from '@/hooks/useApi'
import { VARIANTES, accion, detalle } from '@/lib/api/endpoints'
import type { VarianteProducto } from '@/types/models'
import type { AjustarStockPayload } from '../components/ajustarStockSchema'
import type { VariantePayload } from '../components/productoSchema'

const INVALIDATES: unknown[][] = [['variantes'], ['productos'], ['dashboard', 'resumen']]

export function useAjustarStock(id: number | null) {
  return useApiMutation<VarianteProducto, AjustarStockPayload>({
    url: id ? accion(VARIANTES, id, 'ajustar-stock/') : '',
    method: 'post',
    invalidates: INVALIDATES,
    successMessage: 'Stock ajustado correctamente',
  })
}

export function useActualizarVariante(id: number | null) {
  return useApiMutation<VarianteProducto, VariantePayload>({
    url: id ? detalle(VARIANTES, id) : '',
    method: 'patch',
    invalidates: INVALIDATES,
    successMessage: 'Variante actualizada correctamente',
  })
}

export function useDesactivarVariante(id: number | null) {
  return useApiMutation<null, void>({
    url: id ? detalle(VARIANTES, id) : '',
    method: 'delete',
    invalidates: INVALIDATES,
    successMessage: 'Variante desactivada correctamente',
  })
}