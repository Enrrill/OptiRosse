import { useNavigate } from 'react-router'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/Icon'

export default function ForbiddenPage() {
  const navigate = useNavigate()
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-error-container text-on-error-container">
        <Icon name="lock" size={32} />
      </div>
      <div>
        <h1 className="font-heading text-headline-lg font-bold text-on-surface">403</h1>
        <p className="mt-1 text-on-surface-variant">
          No tienes permisos para acceder a esta sección.
        </p>
      </div>
      <Button onClick={() => navigate('/')}>
        <Icon name="home" /> Volver al inicio
      </Button>
    </div>
  )
}
