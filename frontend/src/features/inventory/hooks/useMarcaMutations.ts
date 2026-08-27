import { useApiMutation } from '@/hooks/useApi'
import { MARCAS, detalle } from '@/lib/api/endpoints'
import type { Marca } from '@/types/models'
import type { MarcaPayload } from '../components/marcaSchema'

const INVALIDATES: unknown[][] = [['marcas'], ['productos']]

export function useCrearMarca() {
  return useApiMutation<Marca, MarcaPayload>({
    url: MARCAS,
    method: 'post',
    invalidates: INVALIDATES,
    successMessage: 'Marca creada correctamente',
  })
}

export function useActualizarMarca(id: number | null) {
  return useApiMutation<Marca, MarcaPayload>({
    url: id ? detalle(MARCAS, id) : '',
    method: 'patch',
    invalidates: INVALIDATES,
    successMessage: 'Marca actualizada correctamente',
  })
}

export function useDesactivarMarca(id: number | null) {
  return useApiMutation<null, void>({
    url: id ? detalle(MARCAS, id) : '',
    method: 'delete',
    invalidates: INVALIDATES,
    successMessage: 'Marca desactivada correctamente',
  })
}

export function useReactivarMarca(id: number | null) {
  return useApiMutation<Marca, { activo: boolean }>({
    url: id ? detalle(MARCAS, id) : '',
    method: 'patch',
    invalidates: INVALIDATES,
    successMessage: 'Marca reactivada correctamente',
  })
}
