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

function Stat({ label, value, tone }: { label: string; value: string; tone?: 'negative' }) {
  return (
    <div className="rounded-xl border border-outline-variant bg-surface-container-low p-4">
      <p className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
        {label}
      </p>
      <p
        className={`mt-1 font-heading text-headline-md ${
          tone === 'negative' ? 'text-error' : 'text-on-surface'
        }`}
      >
        {value}
      </p>
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
    return <ErrorState message={error?.defaultMessage ?? 'Ocurrió un error al cargar el cliente.'} onRetry={() => refetch()} />
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
    <div>
      <Link
        to="/clientes"
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-on-surface-variant transition-colors hover:text-primary"
      >
        <Icon name="arrow_back" size={16} /> Clientes
      </Link>

      <PageHeader
        title={cliente.nombre_comercial}
        description={`${cliente.identificacion_fiscal} · ${formatDateTime(cliente.creado_en)}`}
        actions={
          <>
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
          </>
        }
      />

      {!cliente.activo && (
        <div className="mb-6 flex flex-col justify-between gap-3 rounded-xl border border-error-container bg-error-container/20 p-4 sm:flex-row sm:items-center">
          <div className="flex items-start gap-3">
            <Icon name="block" className="mt-0.5 text-error" />
            <div>
              <h4 className="text-sm font-semibold text-on-surface">Cliente inactivo</h4>
              <p className="text-sm text-on-surface-variant">
                Este cliente está desactivado y no aparece en las listas por defecto.
              </p>
            </div>
          </div>
          {canManage && (
            <Button onClick={() => setConfirmOpen(true)}>
              <Icon name="restart_alt" size={18} /> Reactivar
            </Button>
          )}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Datos de contacto">
          <dl className="divide-y divide-outline-variant/60 rounded-xl border border-outline-variant bg-surface-container-lowest">
            <div className="flex items-center justify-between gap-4 px-4 py-3">
              <dt className="text-sm text-on-surface-variant">Correo electrónico</dt>
              <dd className="text-sm font-medium">{cliente.correo}</dd>
            </div>
            <div className="flex items-center justify-between gap-4 px-4 py-3">
              <dt className="text-sm text-on-surface-variant">Teléfono</dt>
              <dd className="text-sm font-medium">{cliente.telefono}</dd>
            </div>
            <div className="flex items-start justify-between gap-4 px-4 py-3">
              <dt className="text-sm text-on-surface-variant">Dirección</dt>
              <dd className="max-w-[60%] text-right text-sm font-medium">{cliente.direccion}</dd>
            </div>
            <div className="flex items-center justify-between gap-4 px-4 py-3">
              <dt className="text-sm text-on-surface-variant">Razón social</dt>
              <dd className="text-sm font-medium">{cliente.razon_social}</dd>
            </div>
          </dl>
        </Panel>

        <Panel title="Condiciones de crédito">
          <div className="grid gap-4 sm:grid-cols-2">
            <Stat label="Límite de crédito" value={formatMoney(cliente.limite_credito)} />
            <Stat label="Días de crédito" value={`${cliente.dias_credito} días`} />
            <div className="sm:col-span-2">
              {puedeVerSaldo ? (
                saldoLoading ? (
                  <Skeleton className="h-[76px] w-full" />
                ) : (
                  <Stat
                    label="Saldo por cobrar"
                    value={formatMoney(saldo)}
                    tone={saldo < 0 ? 'negative' : undefined}
                  />
                )
              ) : (
                <div className="rounded-xl border border-dashed border-outline-variant bg-surface-container-low p-4">
                  <p className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                    Saldo por cobrar
                  </p>
                  <p className="mt-1 text-sm text-on-surface-variant">
                    Disponible para roles de administración y contabilidad.
                  </p>
                </div>
              )}
            </div>
          </div>
        </Panel>
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
