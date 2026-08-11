import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { PageHeader } from '@/components/data/PageHeader'
import { Panel } from '@/components/data/Panel'
import { StatusBadge } from '@/components/data/StatusBadge'
import { ErrorState } from '@/components/data/ErrorState'
import { ConfirmDialog } from '@/components/forms/ConfirmDialog'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Icon } from '@/components/Icon'
import { useAuthStore } from '@/store/useAuth'
import { estadoActivo } from '@/lib/constants/choices'
import { formatDateTime, formatMoney } from '@/lib/format'
import { useCliente } from '../hooks/useCliente'
import { useSaldoCliente } from '../hooks/useSaldoCliente'
import { useDesactivarCliente, useReactivarCliente } from '../hooks/useClienteMutations'
import { ClienteFormDrawer } from '../components/ClienteFormDrawer'
import type { RolUsuario } from '@/types/models'

const PEDIDOS_ROLES = new Set<RolUsuario>(['administrador', 'contabilidad', 'vendedor_b2b'])
const PAGOS_ROLES = new Set<RolUsuario>(['administrador', 'contabilidad'])

function DetalleSkeleton() {
  return (
    <div>
      <div className="mb-6 space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-44" />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  )
}

export default function ClienteDetallePage() {
  const { id: idParam } = useParams<{ id: string }>()
  const id = idParam && /^\d+$/.test(idParam) ? Number(idParam) : null

  const { cliente, isLoading, isError, error, refetch } = useCliente(id)
  const { saldo, isLoading: saldoLoading, puedeVer: puedeVerSaldo } = useSaldoCliente(id)

  const rol = useAuthStore((s) => s.user?.rol)
  const canManage = rol === 'administrador'
  const puedePedidos = !!rol && PEDIDOS_ROLES.has(rol)
  const puedePagos = !!rol && PAGOS_ROLES.has(rol)

  const [formOpen, setFormOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const desactivar = useDesactivarCliente(cliente?.id ?? null)
  const reactivar = useReactivarCliente(cliente?.id ?? null)

  if (id === null) {
    return <ErrorState message="El cliente solicitado no existe." />
  }

  if (isError) {
    return (
      <ErrorState
        message={error?.defaultMessage ?? 'Ocurrió un error al cargar el cliente.'}
        onRetry={() => refetch()}
      />
    )
  }

  if (isLoading || !cliente) {
    return <DetalleSkeleton />
  }

  const confirmarToggleEstado = async () => {
    if (cliente.activo) await desactivar.mutateAsync()
    else await reactivar.mutateAsync({ activo: true })
    setConfirmOpen(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          to="/clientes"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-on-surface-variant transition-colors hover:text-primary mb-2"
        >
          <Icon name="arrow_back" size={18} /> Volver a Clientes
        </Link>

        <PageHeader
          title={cliente.nombre_comercial}
          description={`Razón Social: ${cliente.razon_social} · RIF: ${cliente.identificacion_fiscal}`}
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge display={estadoActivo(cliente.activo)} />
              {puedePedidos && (
                <Button asChild>
                  <Link to="/pedidos">
                    <Icon name="add_circle" size={18} /> Nuevo pedido
                  </Link>
                </Button>
              )}
              {puedePagos && (
                <Button asChild variant="secondary">
                  <Link to="/finanzas">
                    <Icon name="payments" size={18} /> Registrar pago
                  </Link>
                </Button>
              )}
              {canManage && (
                <>
                  <Button variant="outline" onClick={() => setFormOpen(true)}>
                    <Icon name="edit" size={18} /> Editar
                  </Button>
                  <Button
                    variant={cliente.activo ? 'destructive' : 'default'}
                    onClick={() => setConfirmOpen(true)}
                  >
                    <Icon name={cliente.activo ? 'person_off' : 'restart_alt'} size={18} />
                    {cliente.activo ? 'Desactivar' : 'Reactivar'}
                  </Button>
                </>
              )}
            </div>
          }
        />
      </div>

      {!cliente.activo && (
        <div className="flex flex-col justify-between gap-3 rounded-2xl border border-error-container bg-error-container/20 p-4 sm:flex-row sm:items-center">
          <div className="flex items-start gap-3">
            <Icon name="block" className="mt-0.5 text-error" size={22} />
            <div>
              <h4 className="text-sm font-semibold text-on-surface">Cliente inactivo</h4>
              <p className="text-sm text-on-surface-variant">
                Este cliente está desactivado y no aparece en las listas por defecto. Sus registros se conservan.
              </p>
            </div>
          </div>
          {canManage && (
            <Button onClick={() => setConfirmOpen(true)}>
              <Icon name="restart_alt" size={18} /> Reactivar cliente
            </Button>
          )}
        </div>
      )}

      {/* Top Metric Highlights */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-5 shadow-xs">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="font-label-sm text-xs uppercase tracking-wider font-semibold">Límite de crédito</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-container text-on-primary-container">
              <Icon name="credit_score" size={20} />
            </div>
          </div>
          <p className="mt-2 font-heading text-2xl font-bold text-on-surface">
            {formatMoney(cliente.limite_credito)}
          </p>
          <p className="mt-1 text-xs text-on-surface-variant">Monto máximo autorizado</p>
        </div>

        <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-5 shadow-xs">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="font-label-sm text-xs uppercase tracking-wider font-semibold">Días de crédito</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary-container text-on-secondary-container">
              <Icon name="schedule" size={20} />
            </div>
          </div>
          <p className="mt-2 font-heading text-2xl font-bold text-on-surface">
            {cliente.dias_credito} días
          </p>
          <p className="mt-1 text-xs text-on-surface-variant">Plazo de pago asignado</p>
        </div>

        <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-5 shadow-xs">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="font-label-sm text-xs uppercase tracking-wider font-semibold">Saldo por cobrar</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-tertiary-container text-on-tertiary-container">
              <Icon name="account_balance_wallet" size={20} />
            </div>
          </div>
          <div className="mt-2">
            {puedeVerSaldo ? (
              saldoLoading ? (
                <Skeleton className="h-8 w-32" />
              ) : (
                <p className={`font-heading text-2xl font-bold ${saldo < 0 ? 'text-error' : 'text-on-surface'}`}>
                  {formatMoney(saldo)}
                </p>
              )
            ) : (
              <p className="text-sm font-medium text-on-surface-variant">Restringido por rol</p>
            )}
          </div>
          <p className="mt-1 text-xs text-on-surface-variant">
            {puedeVerSaldo ? 'Deuda actual pendiente' : 'Solo administración / contabilidad'}
          </p>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column (2/3 width) - Contact & Fiscal Details */}
        <div className="lg:col-span-2 space-y-6">
          <Panel title="Datos de contacto e identificación">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-outline-variant/70 bg-surface-container-low/50 p-4">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
                  <Icon name="mail" size={16} className="text-primary" /> Correo electrónico
                </div>
                <p className="font-medium text-on-surface break-all">{cliente.correo}</p>
              </div>

              <div className="rounded-xl border border-outline-variant/70 bg-surface-container-low/50 p-4">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
                  <Icon name="call" size={16} className="text-primary" /> Teléfono
                </div>
                <p className="font-medium text-on-surface">{cliente.telefono}</p>
              </div>

              <div className="rounded-xl border border-outline-variant/70 bg-surface-container-low/50 p-4">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
                  <Icon name="business" size={16} className="text-primary" /> Razón social
                </div>
                <p className="font-medium text-on-surface">{cliente.razon_social}</p>
              </div>

              <div className="rounded-xl border border-outline-variant/70 bg-surface-container-low/50 p-4">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
                  <Icon name="badge" size={16} className="text-primary" /> Identificación fiscal (RIF)
                </div>
                <p className="font-mono font-semibold text-on-surface">{cliente.identificacion_fiscal}</p>
              </div>

              <div className="sm:col-span-2 rounded-xl border border-outline-variant/70 bg-surface-container-low/50 p-4">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
                  <Icon name="location_on" size={16} className="text-primary" /> Dirección fiscal
                </div>
                <p className="font-medium text-on-surface leading-relaxed">{cliente.direccion}</p>
              </div>
            </div>
          </Panel>
        </div>

        {/* Right Column (1/3 width) - Metadata & Status */}
        <div className="space-y-6">
          <Panel title="Detalles del registro">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-outline-variant/60 pb-3">
                <span className="text-sm text-on-surface-variant">ID de cliente</span>
                <span className="font-mono text-sm font-semibold">#{cliente.id}</span>
              </div>
              <div className="flex items-center justify-between border-b border-outline-variant/60 pb-3">
                <span className="text-sm text-on-surface-variant">Estado en plataforma</span>
                <StatusBadge display={estadoActivo(cliente.activo)} />
              </div>
              <div className="flex items-center justify-between border-b border-outline-variant/60 pb-3">
                <span className="text-sm text-on-surface-variant">Fecha de registro</span>
                <span className="text-sm font-medium">{formatDateTime(cliente.creado_en)}</span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-sm text-on-surface-variant">Última actualización</span>
                <span className="text-sm font-medium">{formatDateTime(cliente.actualizado_en)}</span>
              </div>
            </div>
          </Panel>
        </div>
      </div>

      <ClienteFormDrawer open={formOpen} onOpenChange={setFormOpen} cliente={cliente} />

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={cliente.activo ? '¿Desactivar este cliente?' : '¿Reactivar este cliente?'}
        description={
          cliente.activo
            ? `${cliente.nombre_comercial} dejará de aparecer en las listas por defecto. Sus pedidos y movimientos se conservan.`
            : `${cliente.nombre_comercial} volverá a estar disponible para nuevos pedidos.`
        }
        confirmLabel={cliente.activo ? 'Desactivar' : 'Reactivar'}
        variant={cliente.activo ? 'destructive' : 'default'}
        loading={desactivar.isPending || reactivar.isPending}
        onConfirm={confirmarToggleEstado}
      />
    </div>
  )
}
