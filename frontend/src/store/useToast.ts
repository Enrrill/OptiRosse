import { toast, type ExternalToast } from 'sonner'

export function sesionExpirada(): void {
  toast.error('Sesión expirada. Inicia sesión nuevamente.', { id: 'sesion-expirada' })
}

export function useToast() {
  return {
    success: (message: string, options?: ExternalToast) => toast.success(message, options),
    error: (message: string, options?: ExternalToast) => toast.error(message, options),
    warning: (message: string, options?: ExternalToast) => toast.warning(message, options),
    info: (message: string, options?: ExternalToast) => toast.info(message, options),
    promise: toast.promise,
    dismiss: toast.dismiss,
  }
}
