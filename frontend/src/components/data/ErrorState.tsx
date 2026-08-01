import { Icon } from '@/components/Icon'
import { Button } from '@/components/ui/button'

export function ErrorState({
  message = 'Ocurrió un error al cargar los datos',
  onRetry,
}: {
  message?: string
  onRetry?: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-error-container/50 text-error">
        <Icon name="error" size={32} />
      </div>
      <h3 className="font-heading text-headline-md text-on-surface">Algo salió mal</h3>
      <p className="max-w-sm text-sm text-on-surface-variant">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Reintentar
        </Button>
      )}
    </div>
  )
}
