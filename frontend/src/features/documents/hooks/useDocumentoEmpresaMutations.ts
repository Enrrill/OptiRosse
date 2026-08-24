import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'
import { DOCUMENTOS_EMPRESA, accion, detalle } from '@/lib/api/endpoints'
import type { DocumentoEmpresa } from '@/types/models'
import { useToast } from '@/store/useToast'
import type { ApiResponse } from '@/types/api'
import { ApiError } from '@/lib/api/errors'

const INVALIDATES: unknown[][] = [['documentos-empresa']]

/** Petición multipart/form-data a través de apiClient (axios). */
async function requestFormData<T>(
  url: string,
  method: 'post' | 'patch',
  formData: FormData
): Promise<ApiResponse<T>> {
  const res = await apiClient.request<ApiResponse<T>>({
    url,
    method,
    data: formData,
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data
}

export function useCrearDocumentoEmpresa() {
  const queryClient = useQueryClient()
  const toast = useToast()

  return useMutation<ApiResponse<DocumentoEmpresa>, ApiError, FormData>({
    mutationFn: (formData) => requestFormData<DocumentoEmpresa>(DOCUMENTOS_EMPRESA, 'post', formData),
    onSuccess: () => {
      INVALIDATES.forEach((key) => queryClient.invalidateQueries({ queryKey: key }))
      toast.success('Documento subido correctamente')
    },
  })
}

export function useActualizarDocumentoEmpresa(id: number | null) {
  const queryClient = useQueryClient()
  const toast = useToast()

  return useMutation<ApiResponse<DocumentoEmpresa>, ApiError, FormData>({
    mutationFn: (formData) =>
      id
        ? requestFormData<DocumentoEmpresa>(detalle(DOCUMENTOS_EMPRESA, id), 'patch', formData)
        : Promise.reject(new Error('ID no definido')),
    onSuccess: () => {
      INVALIDATES.forEach((key) => queryClient.invalidateQueries({ queryKey: key }))
      toast.success('Documento actualizado correctamente')
    },
  })
}

export function useDesactivarDocumentoEmpresa(id: number | null) {
  const queryClient = useQueryClient()
  const toast = useToast()

  return useMutation<ApiResponse<null>, ApiError, void>({
    mutationFn: () => {
      if (!id) return Promise.reject(new Error('ID no definido'))
      return apiClient.delete(detalle(DOCUMENTOS_EMPRESA, id)).then((r) => r.data)
    },
    onSuccess: () => {
      INVALIDATES.forEach((key) => queryClient.invalidateQueries({ queryKey: key }))
      toast.success('Documento desactivado correctamente')
    },
  })
}

export function useReactivarDocumentoEmpresa(id: number | null) {
  const queryClient = useQueryClient()
  const toast = useToast()

  return useMutation<ApiResponse<DocumentoEmpresa>, ApiError, { activo: boolean }>({
    mutationFn: (payload) => {
      if (!id) return Promise.reject(new Error('ID no definido'))
      return apiClient.post(accion(DOCUMENTOS_EMPRESA, id, 'reactivar'), payload).then((r) => r.data)
    },
    onSuccess: () => {
      INVALIDATES.forEach((key) => queryClient.invalidateQueries({ queryKey: key }))
      toast.success('Documento reactivado correctamente')
    },
  })
}

export function useGenerarDocx(id: number | null) {
  const toast = useToast()
  const queryClient = useQueryClient()

  return async (datos_contexto: Record<string, unknown>, nombreOriginal: string) => {
    if (!id) return
    try {
      const response = await apiClient.post(
        accion(DOCUMENTOS_EMPRESA, id, 'generar-docx'),
        { datos_contexto },
        { responseType: 'blob' }
      )
      const blob = new Blob([response.data as BlobPart], {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const baseName = nombreOriginal.replace(/\.[^/.]+$/, '')
      a.download = `${baseName}_generado.docx`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
      toast.success('Documento generado y descargado correctamente')
      queryClient.invalidateQueries({ queryKey: ['documentos-empresa'] })
    } catch {
      toast.error('Ocurrió un error al generar el documento')
    }
  }
}
