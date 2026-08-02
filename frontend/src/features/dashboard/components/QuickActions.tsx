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
    { label: 'Nuevo pedido', icon: 'add_circle', to: '/pedidos' },
    { label: 'Registrar pago', icon: 'payments', to: '/finanzas' },
    { label: 'Nueva variante', icon: 'library_add', to: '/inventario' },
  ],
  vendedor_b2b: [
    { label: 'Nuevo pedido', icon: 'add_circle', to: '/pedidos' },
    { label: 'Registrar pago', icon: 'payments', to: '/finanzas' },
    { label: 'Nueva variante', icon: 'library_add', to: '/inventario' },
  ],
  almacen: [
    { label: 'Ajustar stock', icon: 'shelf_position', to: '/inventario' },
    { label: 'Pedidos por despachar', icon: 'local_shipping', to: '/pedidos' },
  ],
  tecnico_taller: [{ label: 'Pedidos en taller', icon: 'build', to: '/pedidos' }],
  contabilidad: [
    { label: 'Registrar pago', icon: 'payments', to: '/finanzas' },
    { label: 'Aprobar pagos', icon: 'fact_check', to: '/finanzas' },
  ],
}

export function QuickActions() {
  const rol = useAuthStore((s) => s.user?.rol)
  const actions = rol ? ACTIONS[rol] ?? [] : []

  if (actions.length === 0) return null

  return (
    <section className="mb-lg">
      <h4 className="mb-md font-label-sm uppercase tracking-widest text-on-surface-variant">
        Accesos rápidos
      </h4>
      <div className="flex flex-wrap gap-3">
        {actions.map((action, i) => (
          <Button
            key={action.label}
            asChild
            variant={i === 0 ? 'secondary' : 'outline'}
            className={cn('rounded-full', i === 0 && 'shadow-md shadow-secondary-container/20')}
          >
            <Link to={action.to}>
              <Icon name={action.icon} size={18} />
              {action.label}
            </Link>
          </Button>
        ))}
      </div>
    </section>
  )
}
