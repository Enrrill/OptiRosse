import { Link, useNavigate, useParams, useSearchParams } from 'react-router'
import { PageHeader } from '@/components/data/PageHeader'
import { ErrorState } from '@/components/data/ErrorState'
import { Skeleton } from '@/components/ui/skeleton'
import { Icon } from '@/components/Icon'
import { useApiQuery } from '@/hooks/useApi'
import { useAuthStore } from '@/store/useAuth'
import { CLIENTES, detalle } from '@/lib/api/endpoints'
import type { Cliente, Pedido } from '@/types/models'
import { usePedido } from '../hooks/usePedido'
import { puedeGestionarPedidos } from '../permissions'
import { PedidoForm } from '../components/PedidoForm'

function FormSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-72 w-full" />
      <Skeleton className="h-80 w-full" />
      <Skeleton className="h-56 w-full" />
    </div>
  )
}

export default function PedidoFormPage() {
  const { id: idParam } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const rol = useAuthStore((s) => s.user?.rol)
  const canManage = puedeGestionarPedidos(rol)

  const esEdicion = !!idParam
  const id = idParam && /^\d+$/.test(idParam) ? Number(idParam) : null

  const clienteParam = searchParams.get('cliente')
  const clientePreselectId =
    clienteParam && /^\d+$/.test(clienteParam) ? Number(clienteParam) : null

  const { pedido, isLoading, isError, error } = usePedido(id)

  const preselectCliente = useApiQuery<Cliente>(
    ['cliente', 'preselect', clientePreselectId],
    !esEdicion && clientePreselectId != null ? detalle(CLIENTES, clientePreselectId) : null,
  )

  const volver = esEdicion ? '/pedidos' : '/pedidos'

  if (!canManage) {
    return (
      <ErrorState
        message="No tienes permisos para crear o editar pedidos. Contacta con un administrador."
        onRetry={undefined}
      />
    )
  }

  if (esEdicion && id === null) {
    return <ErrorState message="El pedido solicitado no existe." />
  }

  if (esEdicion && isError) {
    return (
      <ErrorState message={error?.defaultMessage ?? 'Ocurrió un error al cargar el pedido.'} />
    )
  }

  if (esEdicion && (isLoading || !pedido)) {
    return <FormSkeleton />
  }

  if (esEdicion && pedido!.estado !== 'borrador') {
    return (
      <div className="space-y-6">
        <div className="flex flex-col items-start gap-3 rounded-2xl border border-error-container bg-error-container/20 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <Icon name="block" className="mt-0.5 text-error" size={22} />
            <div>
              <h4 className="text-sm font-semibold text-on-surface">Edición no permitida</h4>
              <p className="text-sm text-on-surface-variant">
                Solo se puede editar un pedido en estado <strong>Borrador</strong>. Este pedido ya
                inició su ciclo de vida.
              </p>
            </div>
          </div>
          <Button asChild>
            <Link to={`/pedidos/${pedido!.id}`}>
              <Icon name="visibility" size={18} /> Ver pedido
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  const manejarExito = (p: Pedido) => navigate(`/pedidos/${p.id}`)

  return (
    <div className="space-y-6">
      <Link
        to={volver}
        className="mb-2 inline-flex items-center gap-1.5 text-sm font-medium text-on-surface-variant transition-colors hover:text-primary"
      >
        <Icon name="arrow_back" size={18} /> Volver a Pedidos
      </Link>

      <PageHeader
        title={esEdicion ? `Editar pedido ${pedido!.numero_pedido}` : 'Nuevo pedido'}
        description={
          esEdicion
            ? 'Modifica las líneas y los datos del pedido (solo en borrador).'
            : 'Registra un pedido con sus líneas y totales calculados automáticamente.'
        }
      />

      {clienteParam && preselectCliente.isLoading ? (
        <FormSkeleton />
      ) : (
        <PedidoForm
          pedido={pedido ?? null}
          preselectCliente={preselectCliente.data?.data ?? null}
          onSuccess={manejarExito}
          onCancel={() => navigate('/pedidos')}
        />
      )}
    </div>
  )
}