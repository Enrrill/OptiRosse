import { useNavigate } from 'react-router'
import { Home, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function ForbiddenPage() {
  const navigate = useNavigate()
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-error-container text-on-error-container">
        <Lock size={32} />
      </div>
      <div>
        <h1 className="font-heading text-headline-lg font-bold text-on-surface">403</h1>
        <p className="mt-1 text-on-surface-variant">
          No tienes permisos para acceder a esta seccion.
        </p>
      </div>
      <Button onClick={() => navigate('/')}>
        <Home /> Volver al inicio
      </Button>
    </div>
  )
}
