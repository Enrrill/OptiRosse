import { Link } from 'react-router'
import { Icon } from '@/components/Icon'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/useAuth'
import type { RolUsuario } from '@/types/models'
import { cn } from '@/lib/utils'

interface QuickAction {
  label: string
  icon: string
  to: string
}

const ACTIONS: Record<RolUsuario, QuickAction[]> = {
  administrador: [
    { label: 'Nuevo pedido', icon: 'add_circle', to: '/pedidos/nuevo' },
    { label: 'Registrar pago', icon: 'payments', to: '/finanzas?tab=pagos&nuevo=1' },
    { label: 'Nueva variante', icon: 'library_add', to: '/inventario?tab=variantes' },
  ],
  vendedor_b2b: [
    { label: 'Nuevo pedido', icon: 'add_circle', to: '/pedidos/nuevo' },
    { label: 'Nueva variante', icon: 'library_add', to: '/inventario?tab=variantes' },
  ],
  almacen: [
    { label: 'Ajustar stock', icon: 'shelf_position', to: '/inventario?tab=variantes' },
    { label: 'Pedidos por despachar', icon: 'local_shipping', to: '/pedidos' },
  ],
  tecnico_taller: [{ label: 'Pedidos en taller', icon: 'build', to: '/pedidos' }],
  contabilidad: [
    { label: 'Registrar pago', icon: 'payments', to: '/finanzas?tab=pagos&nuevo=1' },
    { label: 'Aprobar pagos', icon: 'fact_check', to: '/finanzas?tab=pagos' },
  ],
}

export function QuickActions() {
  const rol = useAuthStore((s) => s.user?.rol)
  const actions = rol ? ACTIONS[rol] ?? [] : []

  if (actions.length === 0) return null

  return (
    <section className="rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-4 md:p-5 shadow-xs transition-all duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-container/20 text-primary">
            <Icon name="bolt" size={20} filled />
          </div>
          <div>
            <h4 className="font-heading text-base font-bold text-on-surface leading-tight">
              Accesos rápidos
            </h4>
            <p className="text-xs text-on-surface-variant">
              Operaciones frecuentes para tu rol
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          {actions.map((action, i) => (
            <Button
              key={action.label}
              asChild
              variant={i === 0 ? 'default' : 'outline'}
              className={cn(
                'rounded-full px-4 text-xs font-medium shadow-2xs transition-all duration-200 hover:scale-[1.02]',
                i === 0 && 'bg-primary text-on-primary hover:bg-primary/90 shadow-sm shadow-primary/20',
              )}
            >
              <Link to={action.to} className="flex items-center gap-1.5">
                <Icon name={action.icon} size={16} />
                <span>{action.label}</span>
              </Link>
            </Button>
          ))}
        </div>
      </div>
    </section>
  )
}
