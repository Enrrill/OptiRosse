import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { PageHeader } from '@/components/data/PageHeader'
import { Panel } from '@/components/data/Panel'
import { StatusBadge } from '@/components/data/StatusBadge'
import { ErrorState } from '@/components/data/ErrorState'
import { ConfirmDialog } from '@/components/forms/ConfirmDialog'
import { MotivoDialog } from '@/components/forms/MotivoDialog'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Icon } from '@/components/Icon'
import { useAuthStore } from '@/store/useAuth'
import { choice, ESTADO_PEDIDO } from '@/lib/constants/choices'
import { formatDateTime, formatGradienteCompleto, formatMoney } from '@/lib/format'
import type { EstadoPedido } from '@/types/models'
import { usePedido } from '../hooks/usePedido'
import {
  useCambiarEstadoPedido,
  useConfirmarPedido,
  useEliminarPedido,
} from '../hooks/usePedidoMutations'
import {
  puedeCancelar,
  puedeConfirmarPedido,
  puedeGestionarPedidos,
  siguienteTransicion,
} from '../permissions'
import { OrderTimeline } from '../components/OrderTimeline'
import { PedidoTotalesPanel } from '../components/PedidoTotalesPanel'

const ESTADO_LABEL: Record<EstadoPedido, string> = {
  borrador: 'Borrador',
  confirmado: 'Confirmado',
  en_taller: 'En Taller',
  listo_para_despacho: 'Listo para Despacho',
  enviado: 'Enviado',
  cancelado: 'Cancelado',
}

function DetalleSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-72" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-72 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  )
}

export default function PedidoDetallePage() {
  const { id: idParam } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const id = idParam && /^\d+$/.test(idParam) ? Number(idParam) : null

  const { pedido, isLoading, isError, error, refetch } = usePedido(id)
  const rol = useAuthStore((s) => s.user?.rol)
  const canManage = pedido != null && puedeGestionarPedidos(rol)

  const [confirmarOpen, setConfirmarOpen] = useState(false)
  const [siguienteOpen, setSiguienteOpen] = useState(false)
  const [cancelarOpen, setCancelarOpen] = useState(false)
  const [eliminarOpen, setEliminarOpen] = useState(false)

  const confirmar = useConfirmarPedido(id)
  const cambiarEstado = useCambiarEstadoPedido(id)
  const eliminar = useEliminarPedido(id)

  if (id === null) {
    return <ErrorState message="El pedido solicitado no existe." />
  }

  if (isError) {
    return (
      <ErrorState
        message={error?.defaultMessage ?? 'Ocurrió un error al cargar el pedido.'}
        onRetry={() => refetch()}
      />
    )
  }

  if (isLoading || !pedido) {
    return <DetalleSkeleton />
  }

  const siguiente = siguienteTransicion(pedido.estado, rol)
  const puedeConfirmar = pedido.estado === 'borrador' && puedeConfirmarPedido(rol)
  const puedeCancelarPedido = puedeCancelar(pedido.estado, rol)
  const puedeEditar = canManage && pedido.estado === 'borrador'

  const confirmarSiguiente = async () => {
    if (!siguiente) return
    await cambiarEstado.mutateAsync({ nuevo_estado: siguiente })
    setSiguienteOpen(false)
  }

  const cancelarPedido = async (motivo: string) => {
    await cambiarEstado.mutateAsync({ nuevo_estado: 'cancelado', motivo })
    setCancelarOpen(false)
  }

  const eliminarPedido = async () => {
    await eliminar.mutateAsync()
    navigate('/pedidos')
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          to="/pedidos"
          className="mb-2 inline-flex items-center gap-1.5 text-sm font-medium text-on-surface-variant transition-colors hover:text-primary"
        >
          <Icon name="arrow_back" size={18} /> Volver a Pedidos
        </Link>

        <PageHeader
          title={`Pedido ${pedido.numero_pedido}`}
          description={`Creado por ${pedido.usuario_nombre} · ${formatDateTime(pedido.creado_en)}`}
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge display={choice(ESTADO_PEDIDO, pedido.estado)} />
              {puedeConfirmar && (
                <Button onClick={() => setConfirmarOpen(true)}>
                  <Icon name="check_circle" size={18} /> Confirmar pedido
                </Button>
              )}
              {siguiente && (
                <Button onClick={() => setSiguienteOpen(true)}>
                  <Icon name="chevron_right" size={18} /> Marcar como {ESTADO_LABEL[siguiente].toLowerCase()}
                </Button>
              )}
              {puedeEditar && (
                <>
                  <Button asChild variant="outline">
                    <Link to={`/pedidos/${pedido.id}/editar`}>
                      <Icon name="edit" size={18} /> Editar
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="text-error hover:bg-error-container/40 hover:text-error"
                    onClick={() => setEliminarOpen(true)}
                  >
                    <Icon name="delete" size={18} /> Eliminar
                  </Button>
                </>
              )}
              {puedeCancelarPedido && (
                <Button variant="destructive" onClick={() => setCancelarOpen(true)}>
                  <Icon name="block" size={18} /> Cancelar pedido
                </Button>
              )}
            </div>
          }
        />
      </div>

      <OrderTimeline estado={pedido.estado} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Panel title="Líneas del pedido">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-outline-variant text-left text-xs uppercase tracking-wider text-on-surface-variant">
                    <th className="pb-2 pr-3 font-semibold">Producto</th>
                    <th className="pb-2 pr-3 text-right font-semibold">Cant.</th>
                    <th className="pb-2 pr-3 text-right font-semibold">Precio unit.</th>
                    <th className="pb-2 text-right font-semibold">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {pedido.detalles.map((detalle) => (
                    <tr key={detalle.id} className="border-b border-outline-variant/50 last:border-0">
                      <td className="py-3 pr-3">
                        <p className="font-mono text-sm font-medium text-on-surface">
                          {detalle.variante_detalle.sku}
                        </p>
                        <p className="text-xs text-on-surface-variant">
                          {[
                            [detalle.variante_detalle.color, detalle.variante_detalle.tamano]
                              .filter(Boolean)
                              .join(' · '),
                            formatGradienteCompleto(
                              detalle.variante_detalle.esfera,
                              detalle.variante_detalle.cilindro,
                              detalle.variante_detalle.eje,
                            ),
                          ]
                            .filter(Boolean)
                            .join(' · ')}
                        </p>
                      </td>
                      <td className="py-3 pr-3 text-right">{detalle.cantidad}</td>
                      <td className="py-3 pr-3 text-right">{formatMoney(detalle.precio_unitario)}</td>
                      <td className="py-3 text-right font-medium text-on-surface">
                        {formatMoney(detalle.precio_total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-6">
              <PedidoTotalesPanel
                subtotal={Number(pedido.subtotal)}
                impuesto={Number(pedido.impuesto)}
                total={Number(pedido.total)}
              />
            </div>
          </Panel>

          {pedido.notas && (
            <Panel title="Notas">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-on-surface">
                {pedido.notas}
              </p>
            </Panel>
          )}
        </div>

        <div className="space-y-6">
          <Panel title="Resumen">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-outline-variant/60 pb-3">
                <span className="text-sm text-on-surface-variant">Cliente</span>
                <Link
                  to={`/clientes/${pedido.cliente}`}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  {pedido.cliente_detalle.nombre_comercial}
                </Link>
              </div>
              <div className="flex items-center justify-between border-b border-outline-variant/60 pb-3">
                <span className="text-sm text-on-surface-variant">Receta óptica</span>
                <span className="text-sm font-medium">
                  {pedido.receta_detalle?.nombre_paciente ?? '—'}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-outline-variant/60 pb-3">
                <span className="text-sm text-on-surface-variant">Registrado por</span>
                <span className="text-sm font-medium">{pedido.usuario_nombre}</span>
              </div>
              <div className="flex items-center justify-between border-b border-outline-variant/60 pb-3">
                <span className="text-sm text-on-surface-variant">Estado</span>
                <StatusBadge display={choice(ESTADO_PEDIDO, pedido.estado)} />
              </div>
              <div className="flex items-center justify-between border-b border-outline-variant/60 pb-3">
                <span className="text-sm text-on-surface-variant">Creado</span>
                <span className="text-sm font-medium">{formatDateTime(pedido.creado_en)}</span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-sm text-on-surface-variant">Última actualización</span>
                <span className="text-sm font-medium">{formatDateTime(pedido.actualizado_en)}</span>
              </div>
            </div>
          </Panel>
        </div>
      </div>

      <ConfirmDialog
        open={confirmarOpen}
        onOpenChange={setConfirmarOpen}
        title="¿Confirmar este pedido?"
        description="Al confirmar se descuenta stock de los productos y se registra un asiento de débito en el libro mayor del cliente. Esta acción no se puede deshacer."
        confirmLabel="Confirmar pedido"
        loading={confirmar.isPending}
        onConfirm={async () => {
          await confirmar.mutateAsync()
          setConfirmarOpen(false)
        }}
      />

      <ConfirmDialog
        open={siguienteOpen}
        onOpenChange={setSiguienteOpen}
        title={`¿Marcar como ${siguiente ? ESTADO_LABEL[siguiente].toLowerCase() : 'siguiente estado'}?`}
        description={
          siguiente === 'enviado'
            ? 'El pedido se marcará como enviado y completará su ciclo de vida.'
            : `El pedido avanzará al estado ${siguiente ? ESTADO_LABEL[siguiente] : ''}.`
        }
        confirmLabel={siguiente ? `Marcar como ${ESTADO_LABEL[siguiente]}` : undefined}
        loading={cambiarEstado.isPending}
        onConfirm={confirmarSiguiente}
      />

      <MotivoDialog
        open={cancelarOpen}
        onOpenChange={setCancelarOpen}
        title="¿Cancelar este pedido?"
        description="Se necesita un motivo. El pedido quedará en estado cancelado y no podrá continuar."
        confirmLabel="Cancelar pedido"
        loading={cambiarEstado.isPending}
        onSubmit={cancelarPedido}
      />

      <ConfirmDialog
        open={eliminarOpen}
        onOpenChange={setEliminarOpen}
        title="¿Eliminar este pedido?"
        description="El pedido se eliminará de forma permanente. Solo se puede eliminar un pedido en estado borrador."
        confirmLabel="Eliminar"
        variant="destructive"
        loading={eliminar.isPending}
        onConfirm={eliminarPedido}
      />
    </div>
  )
}