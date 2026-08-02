import { toast } from 'sonner'

export function sesionExpirada(): void {
  toast.error('Sesión expirada. Inicia sesión nuevamente.', { id: 'sesion-expirada' })
}

export function useToast() {
  return {
    success: (message: string) => toast.success(message),
    error: (message: string) => toast.error(message),
    info: (message: string) => toast(message),
  }
}
