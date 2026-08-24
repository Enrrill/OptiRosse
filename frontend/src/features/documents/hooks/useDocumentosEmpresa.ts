import { useApiQuery } from '@/hooks/useApi'
import { DOCUMENTOS_EMPRESA } from '@/lib/api/endpoints'
import type { PaginationParams } from '@/types/api'
import type { CategoriaDocumentoEmpresa, DocumentoEmpresa } from '@/types/models'

interface UseDocumentosEmpresaParams extends PaginationParams {
  categoria?: CategoriaDocumentoEmpresa
  extension?: string
  es_plantilla_generable?: string
}

export function useDocumentosEmpresa(params: UseDocumentosEmpresaParams) {
  const query = useApiQuery<DocumentoEmpresa[]>(
    ['documentos-empresa', params],
    DOCUMENTOS_EMPRESA,
    { params }
  )

  return {
    documentos: query.data?.data ?? [],
    count: query.data?.meta?.count ?? 0,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}
