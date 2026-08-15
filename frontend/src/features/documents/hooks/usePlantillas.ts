import { useApiQuery } from '@/hooks/useApi'
import { PLANTILLAS } from '@/lib/api/endpoints'
import type { PaginationParams } from '@/types/api'
import type { PlantillaDocumento, TipoDocumento } from '@/types/models'

interface UsePlantillasParams extends PaginationParams {
  tipo_documento?: TipoDocumento
}

export function usePlantillas(params: UsePlantillasParams) {
  const query = useApiQuery<PlantillaDocumento[]>(['plantillas', params], PLANTILLAS, { params })

  return {
    plantillas: query.data?.data ?? [],
    count: query.data?.meta?.count ?? 0,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}