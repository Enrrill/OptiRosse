import { useMemo, useState } from 'react'
import { PageHeader } from '@/components/data/PageHeader'
import { ConfirmDialog } from '@/components/forms/ConfirmDialog'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/Icon'
import { useAuthStore } from '@/store/useAuth'
import { usePagination } from '@/hooks/usePagination'
import type { PaginationParams } from '@/types/api'
import { useClientes } from '../hooks/useClientes'
import { useDesactivarCliente, useReactivarCliente } from '../hooks/useClienteMutations'
import { ClientesTable } from '../components/ClientesTable'
import { ClienteFormDrawer } from '../components/ClienteFormDrawer'
import type { Cliente } from '@/types/models'

export default function ClientesPage() {
  const pagination = usePagination()
  const [showInactivos, setShowInactivos] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Cliente | null>(null)
  const [estadoTarget, setEstadoTarget] = useState<Cliente | null>(null)

  const canManage = useAuthStore((s) => s.user?.rol) === 'administrador'

  const params = useMemo<PaginationParams>(() => {
    const p: PaginationParams = { ...pagination.params }
    if (showInactivos) p.activo = 'false'
    return p
  }, [pagination.params, showInactivos])

  const { clientes, count, isLoading, isError, error, refetch } = useClientes(params)

  const desactivar = useDesactivarCliente(estadoTarget?.id ?? null)
  const reactivar = useReactivarCliente(estadoTarget?.id ?? null)

  const abrirNuevo = () => {
    setEditing(null)
    setFormOpen(true)
  }

  const abrirEdicion = (cliente: Cliente) => {
    setEditing(cliente)
    setFormOpen(true)
  }

  const confirmarToggleEstado = async () => {
    if (!estadoTarget) return
    if (estadoTarget.activo) await desactivar.mutateAsync()
    else await reactivar.mutateAsync({ activo: true })
    setEstadoTarget(null)
  }

  const esInactivo = estadoTarget != null && !estadoTarget.activo

  return (
    <div>
      <PageHeader
        title="Clientes"
        description="Gestiona la cartera de clientes y sus condiciones de crédito."
        actions={
          canManage ? (
            <Button onClick={abrirNuevo}>
              <Icon name="add" size={18} /> Nuevo cliente
            </Button>
          ) : undefined
        }
      />

      <ClientesTable
        clientes={clientes}
        count={count}
        page={pagination.page}
        pageSize={pagination.pageSize}
        onPageChange={pagination.setPage}
        isLoading={isLoading}
        isError={isError}
        errorMessage={error?.defaultMessage}
        onRetry={() => refetch()}
        search={pagination.search}
        onSearchChange={(value) => {
          pagination.setSearch(value)
          pagination.resetPage()
        }}
        showInactivos={showInactivos}
        onToggleInactivos={(value) => {
          setShowInactivos(value)
          pagination.resetPage()
        }}
        onEdit={abrirEdicion}
        onToggleEstado={(cliente) => setEstadoTarget(cliente)}
        onNuevo={abrirNuevo}
      />

      <ClienteFormDrawer open={formOpen} onOpenChange={setFormOpen} cliente={editing} />

      <ConfirmDialog
        open={estadoTarget != null}
        onOpenChange={(open) => {
          if (!open) setEstadoTarget(null)
        }}
        title={esInactivo ? '¿Reactivar este cliente?' : '¿Desactivar este cliente?'}
        description={
          esInactivo
            ? `${estadoTarget?.nombre_comercial} volverá a estar disponible para nuevos pedidos.`
            : `${estadoTarget?.nombre_comercial} dejará de aparecer en las listas por defecto. Sus pedidos y movimientos se conservan.`
        }
        confirmLabel={esInactivo ? 'Reactivar' : 'Desactivar'}
        variant={esInactivo ? 'default' : 'destructive'}
        loading={desactivar.isPending || reactivar.isPending}
        onConfirm={confirmarToggleEstado}
      />
    </div>
  )
}
