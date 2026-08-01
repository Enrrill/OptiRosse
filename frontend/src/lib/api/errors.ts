import type { ApiErrorDetail, FieldErrors } from '@/types/api'

export class ApiError extends Error {
  readonly status: number
  readonly code?: string
  readonly errors: FieldErrors | ApiErrorDetail[] | null

  constructor(
    message: string,
    status: number,
    errors?: FieldErrors | ApiErrorDetail[] | null,
    code?: string,
  ) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.errors = errors ?? null
    this.code = code
  }

  /** Mensajes para un campo concreto (validaciones del envelope). */
  fieldMessages(field: string): string[] | undefined {
    if (this.errors && !Array.isArray(this.errors)) {
      return this.errors[field]
    }
    return undefined
  }

  /** Primer código de negocio (errores de negocio del backend). */
  get businessCode(): string | undefined {
    if (Array.isArray(this.errors) && this.errors.length > 0) {
      return this.errors[0]?.code
    }
    return this.code
  }

  /** Todos los mensajes legibles para toast/lista. */
  get messages(): string[] {
    if (Array.isArray(this.errors)) {
      return this.errors.map((e) => e.detail)
    }
    if (this.errors) {
      return Object.values(this.errors).flat()
    }
    return this.message ? [this.message] : []
  }

  get defaultMessage(): string {
    return this.messages[0] ?? this.message ?? 'Ocurrió un error'
  }
}
