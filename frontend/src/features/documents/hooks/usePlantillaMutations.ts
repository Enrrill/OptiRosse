import { useApiMutation } from '@/hooks/useApi'
import { PLANTILLAS, detalle } from '@/lib/api/endpoints'
import type { PlantillaDocumento, PlantillaDocumentoPayload } from '@/types/models'

const INVALIDATES: unknown[][] = [['plantillas']]

export function useCrearPlantilla() {
  return useApiMutation<PlantillaDocumento, PlantillaDocumentoPayload>({
    url: PLANTILLAS,
    method: 'post',
    invalidates: INVALIDATES,
    successMessage: 'Plantilla creada correctamente',
  })
}

export function useActualizarPlantilla(id: number | null) {
  return useApiMutation<PlantillaDocumento, PlantillaDocumentoPayload>({
    url: id ? detalle(PLANTILLAS, id) : '',
    method: 'patch',
    invalidates: INVALIDATES,
    successMessage: 'Plantilla actualizada correctamente',
  })
}

export function useDesactivarPlantilla(id: number | null) {
  return useApiMutation<null, void>({
    url: id ? detalle(PLANTILLAS, id) : '',
    method: 'delete',
    invalidates: INVALIDATES,
    successMessage: 'Plantilla desactivada correctamente',
  })
}

export function useReactivarPlantilla(id: number | null) {
  return useApiMutation<PlantillaDocumento, { activo: boolean }>({
    url: id ? detalle(PLANTILLAS, id) : '',
    method: 'patch',
    invalidates: INVALIDATES,
    successMessage: 'Plantilla reactivada correctamente',
  })
}