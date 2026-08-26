import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { PageHeader } from '@/components/data/PageHeader'
import { ConfirmDialog } from '@/components/forms/ConfirmDialog'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/Icon'
import { useAuthStore } from '@/store/useAuth'
import { useToast } from '@/store/useToast'
import { ApiError } from '@/lib/api/errors'
import { usePagination } from '@/hooks/usePagination'
import { usePedidos, type PedidoParams } from '../hooks/usePedidos'
import { useEliminarPedido } from '../hooks/usePedidoMutations'
import { useClientesOpciones } from '../hooks/useClientesOpciones'
import { puedeGestionarPedidos } from '../permissions'
import { PedidosTable } from '../components/PedidosTable'
import type { Pedido } from '@/types/models'

const ESTADOS = ['borrador', 'confirmado', 'en_taller', 'listo_para_despacho', 'enviado', 'cancelado']

export default function PedidosPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const pagination = usePagination({ storageKey: 'pedidos', pageSize: 8 })
  const rol = useAuthStore((s) => s.user?.rol)
  const canManage = puedeGestionarPedidos(rol)

  const [estadoFiltro, setEstadoFiltro] = useState(() => {
    const desdeUrl = searchParams.get('estado')
    return desdeUrl && ESTADOS.includes(desdeUrl) ? desdeUrl : ''
  })
  const [clienteFiltro, setClienteFiltro] = useState<number | null>(() => {
    const desdeUrl = searchParams.get('cliente')
    return desdeUrl && /^\d+$/.test(desdeUrl) ? Number(desdeUrl) : null
  })
  const [fechaDesde, setFechaDesde] = useState('')
  const [fechaHasta, setFechaHasta] = useState('')
  const [eliminarTarget, setEliminarTarget] = useState<Pedido | null>(null)

  const { clientes } = useClientesOpciones()

  const params = useMemo<PedidoParams>(() => {
    const p: PedidoParams = { ...pagination.params }
    if (estadoFiltro) p.estado = estadoFiltro
    if (clienteFiltro != null) p.cliente = clienteFiltro
    if (fechaDesde) p.fecha_creado_after = fechaDesde
    if (fechaHasta) p.fecha_creado_before = fechaHasta
    return p
  }, [pagination.params, estadoFiltro, clienteFiltro, fechaDesde, fechaHasta])

  const { pedidos, count, isLoading, isError, error, refetch } = usePedidos(params)
  const eliminar = useEliminarPedido(eliminarTarget?.id ?? null)
  const toast = useToast()

  const actualizarEstadoFiltro = (value: string) => {
    setEstadoFiltro(value)
    pagination.resetPage()
    setSearchParams(value ? { estado: value } : {}, { replace: true })
  }

  const confirmarEliminacion = async () => {
    if (!eliminarTarget) return
    try {
      await eliminar.mutateAsync()
      setEliminarTarget(null)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.defaultMessage : 'No se pudo eliminar el pedido')
    }
  }

  return (
    <div>
      <PageHeader
        title="Pedidos"
        description="Gestiona el ciclo de vida de los pedidos: borrador a enviado."
        actions={
          canManage ? (
            <Button onClick={() => navigate('/pedidos/nuevo')}>
              <Icon name="add" size={18} /> Nuevo pedido
            </Button>
          ) : undefined
        }
      />

      <PedidosTable
        pedidos={pedidos}
        count={count}
        page={pagination.page}
        pageSize={pagination.pageSize}
        onPageChange={pagination.setPage}
        onPageSizeChange={pagination.setPageSize}
        isLoading={isLoading}
        isError={isError}
        errorMessage={error?.defaultMessage}
        onRetry={() => refetch()}
        search={pagination.search}
        onSearchChange={(value) => {
          pagination.setSearch(value)
          pagination.resetPage()
        }}
        estadoFiltro={estadoFiltro}
        onEstadoChange={actualizarEstadoFiltro}
        clientes={clientes}
        clienteFiltro={clienteFiltro}
        onClienteChange={(value) => {
          setClienteFiltro(value)
          pagination.resetPage()
        }}
        fechaDesde={fechaDesde}
        onFechaDesdeChange={(value) => {
          setFechaDesde(value)
          pagination.resetPage()
        }}
        fechaHasta={fechaHasta}
        onFechaHastaChange={(value) => {
          setFechaHasta(value)
          pagination.resetPage()
        }}
        canManage={canManage}
        onVer={(pedido) => navigate(`/pedidos/${pedido.id}`)}
        onEditar={(pedido) => navigate(`/pedidos/${pedido.id}/editar`)}
        onEliminar={setEliminarTarget}
        onNuevo={() => navigate('/pedidos/nuevo')}
      />

      <ConfirmDialog
        open={eliminarTarget != null}
        onOpenChange={(open) => {
          if (!open) setEliminarTarget(null)
        }}
        title={`¿Eliminar pedido ${eliminarTarget?.numero_pedido ?? ''}?`}
        description="El pedido se eliminará de forma permanente. Solo se permite en estado borrador."
        confirmLabel="Eliminar"
        variant="destructive"
        loading={eliminar.isPending}
        onConfirm={confirmarEliminacion}
      />
    </div>
  )
}