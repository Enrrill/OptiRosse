export interface Meta {
  count: number
  next: string | null
  previous: string | null
}

export type FieldErrors = Record<string, string[]>

export interface ApiErrorDetail {
  code: string
  detail: string
}

export interface Envelope<T = unknown, M = Meta | null> {
  success: boolean
  data: T
  errors: FieldErrors | ApiErrorDetail[] | null
  message: string | null
  meta: M
}

/** Forma que devuelve el interceptor de axios tras desenvolver el envelope. */
export interface ApiResponse<T> {
  data: T
  meta: Meta | null
  message: string | null
}

export interface ApiListResponse<T> {
  data: T[]
  meta: Meta
  message: string | null
}

export interface PaginationParams {
  page?: number
  page_size?: number
  search?: string
  ordering?: string
  activo?: boolean | 'false'
  [key: string]: unknown
}
