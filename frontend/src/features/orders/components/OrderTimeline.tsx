import { cn } from '@/lib/utils'
import { Icon } from '@/components/Icon'
import type { EstadoPedido } from '@/types/models'

const PASOS: { estado: EstadoPedido; label: string; icon: string }[] = [
  { estado: 'borrador', label: 'Borrador', icon: 'draft' },
  { estado: 'confirmado', label: 'Confirmado', icon: 'check_circle' },
  { estado: 'en_taller', label: 'En Taller', icon: 'build' },
  { estado: 'listo_para_despacho', label: 'Listo para Despacho', icon: 'inventory_2' },
  { estado: 'enviado', label: 'Enviado', icon: 'local_shipping' },
]

export function OrderTimeline({ estado }: { estado: EstadoPedido }) {
  const indiceActual = PASOS.findIndex((paso) => paso.estado === estado)
  const cancelado = estado === 'cancelado'

  return (
    <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-6 shadow-xs">
      {cancelado && (
        <div className="mb-5 flex items-center gap-3 rounded-xl border border-error-container bg-error-container/20 p-4">
          <Icon name="block" className="shrink-0 text-error" size={22} />
          <div>
            <h4 className="text-sm font-semibold text-on-surface">Pedido cancelado</h4>
            <p className="text-sm text-on-surface-variant">
              Este pedido fue cancelado y ya no puede continuar su ciclo de vida.
            </p>
          </div>
        </div>
      )}
      <div className="flex items-center justify-between gap-2 overflow-x-auto">
        {PASOS.map((paso, index) => {
          const completado = !cancelado && indiceActual >= 0 && index <= indiceActual
          const actual = !cancelado && index === indiceActual
          return (
            <div key={paso.estado} className="flex min-w-0 flex-1 items-center last:flex-none">
              <div className="flex min-w-0 flex-col items-center gap-1.5">
                <div
                  className={cn(
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                    completado
                      ? 'border-green-500 bg-green-500/15 text-green-700 dark:text-green-300'
                      : actual
                        ? 'border-primary bg-primary-container/30 text-primary'
                        : 'border-outline-variant bg-surface-container-low text-outline',
                  )}
                >
                  <Icon
                    name={completado ? 'check' : paso.icon}
                    size={18}
                    className="currentColor"
                  />
                </div>
                <span
                  className={cn(
                    'whitespace-nowrap text-xs font-medium',
                    actual ? 'text-primary' : completado ? 'text-green-700 dark:text-green-300' : 'text-on-surface-variant',
                  )}
                >
                  {paso.label}
                </span>
              </div>
              {index < PASOS.length - 1 && (
                <div
                  className={cn(
                    'mx-2 h-0.5 min-w-6 flex-1 rounded-full',
                    !cancelado && index < indiceActual ? 'bg-green-500/60' : 'bg-outline-variant',
                  )}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}