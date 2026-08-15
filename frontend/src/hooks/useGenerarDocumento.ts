import { useMutation } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'
import { PLANTILLAS, accion } from '@/lib/api/endpoints'
import { ApiError } from '@/lib/api/errors'
import { descargarBlob, extraerNombreDeDisposition } from '@/lib/download'

export type FormatoDocumento = 'html' | 'pdf'

export interface GenerarDocumentoVariables {
  objetoId: number
  formato: FormatoDocumento
}

/**
 * Genera y descarga un documento desde una plantilla.
 * El backend devuelve el archivo (blob) con `Content-Disposition: attachment`;
 * los errores llegan como envelope-en-Blob y se convierten en `ApiError`.
 */
export function useGenerarDocumento(plantillaId: number | null) {
  return useMutation<void, ApiError, GenerarDocumentoVariables>({
    mutationFn: async ({ objetoId, formato }) => {
      if (plantillaId === null) {
        throw new ApiError('No hay una plantilla seleccionada', 400)
      }
      const res = await apiClient.post<Blob>(
        accion(PLANTILLAS, plantillaId, 'generar'),
        { objeto_id: objetoId, formato },
        { responseType: 'blob' },
      )
      const nombreArchivo =
        extraerNombreDeDisposition(res.headers['content-disposition']) ?? 'documento.html'
      descargarBlob(res.data, nombreArchivo)
    },
  })
}