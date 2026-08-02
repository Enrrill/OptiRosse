import axios, { AxiosError, type AxiosResponse } from 'axios'
import type { ApiResponse, Envelope } from '@/types/api'
import { useAuthStore } from '@/store/useAuth'
import { API_BASE, AUTH_ENDPOINTS } from './endpoints'
import { ApiError } from './errors'
import { notifyTokens } from './authSync'
import { sesionExpirada } from '@/store/useToast'

const SKIP_REFRESH_PATHS = [
  AUTH_ENDPOINTS.login,
  AUTH_ENDPOINTS.refresh,
  AUTH_ENDPOINTS.logout,
]

export const apiClient = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
})

apiClient.interceptors.request.use((config) => {
  const access = useAuthStore.getState().access
  if (access) {
    config.headers.Authorization = `Bearer ${access}`
  }
  return config
})

let isRefreshing = false
let refreshQueue: Array<{ resolve: (access: string) => void; reject: (err: unknown) => void }> = []

async function refreshAccessToken(): Promise<string> {
  const { refresh } = useAuthStore.getState()
  if (!refresh) throw new Error('Sin token de refresco')

  if (!isRefreshing) {
    isRefreshing = true
    try {
      const { data } = await axios.post<{ access: string; refresh?: string }>(
        `${API_BASE}${AUTH_ENDPOINTS.refresh}`,
        { refresh },
      )
      const nextRefresh = data.refresh ?? refresh
      useAuthStore.getState().setTokens(data.access, nextRefresh)
      notifyTokens(data.access, nextRefresh)
      refreshQueue.forEach((item) => item.resolve(data.access))
      refreshQueue = []
      return data.access
    } catch (err) {
      refreshQueue.forEach((item) => item.reject(err))
      refreshQueue = []
      sesionExpirada()
      useAuthStore.getState().logout()
      throw err
    } finally {
      isRefreshing = false
    }
  }

  return new Promise<string>((resolve, reject) => {
    refreshQueue.push({ resolve, reject })
  })
}

function shouldSkipRefresh(url: string | undefined): boolean {
  if (!url) return true
  return SKIP_REFRESH_PATHS.some((path) => url.includes(path))
}

async function toApiError(error: unknown, status: number): Promise<ApiError> {
  if (error instanceof ApiError) return error
  const axiosError = error as AxiosError<Envelope>
  const raw = axiosError.response?.data

  if (raw instanceof Blob) {
    try {
      const text = await raw.text()
      const parsed = JSON.parse(text) as Envelope
      return new ApiError(parsed.message ?? 'Error del servidor', status, parsed.errors)
    } catch {
      return new ApiError('Error del servidor', status)
    }
  }

  if (raw && typeof raw === 'object' && 'message' in raw) {
    return new ApiError(raw.message ?? 'Error del servidor', status, raw.errors)
  }
  if (status >= 500) return new ApiError('Error interno del servidor', status)
  return new ApiError('Solicitud inválida', status)
}

apiClient.interceptors.response.use(
  (response) => {
    if (response.config.responseType === 'blob') return response

    const envelope = response.data as Envelope
    if (envelope && typeof envelope === 'object' && 'success' in envelope) {
      const unwrapped: ApiResponse<unknown> = {
        data: envelope.data,
        meta: envelope.meta ?? null,
        message: envelope.message ?? null,
      }
      return { ...response, data: unwrapped } as AxiosResponse<ApiResponse<unknown>>
    }
    return response
  },
  async (error: unknown) => {
    const axiosError = error as AxiosError
    const status = axiosError.response?.status ?? 0
    const original = axiosError.config

    if (status === 401 && original && !shouldSkipRefresh(original.url) && !original._retry) {
      original._retry = true
      try {
        const access = await refreshAccessToken()
        original.headers = original.headers ?? {}
        original.headers.Authorization = `Bearer ${access}`
        return apiClient(original)
      } catch (refreshError) {
        return Promise.reject(await toApiError(refreshError, 401))
      }
    }

    return Promise.reject(await toApiError(error, status))
  },
)
