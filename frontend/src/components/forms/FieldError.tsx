import { AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export function FieldError({ message, className }: { message?: string; className?: string }) {
  if (!message) return null
  return (
    <p className={cn('mt-1 flex items-center gap-1 text-xs font-medium text-error', className)}>
      <AlertCircle size={14} />
      {message}
    </p>
  )
}
