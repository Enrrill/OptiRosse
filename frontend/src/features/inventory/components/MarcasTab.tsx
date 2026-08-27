import { useMemo, useState } from 'react'
import { useAuthStore } from '@/store/useAuth'
import { usePagination } from '@/hooks/usePagination'
import { ConfirmDialog } from '@/components/forms/ConfirmDialog'
import { useMarcas, type MarcaParams } from '../hooks/useMarcas'
import { useDesactivarMarca, useReactivarMarca } from '../hooks/useMarcaMutations'
import { MarcasTable } from './MarcasTable'
import { MarcaFormDialog } from './MarcaFormDialog'
import type { Marca } from '@/types/models'

interface MarcasTabProps {
  triggerNuevo?: number
}

export function MarcasTab({ triggerNuevo }: MarcasTabProps) {
  const pagination = usePagination({ storageKey: 'inventario-marcas', pageSize: 8 })
  const [showInactivas, setShowInactivas] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Marca | null>(null)
  const [estadoTarget, setEstadoTarget] = useState<Marca | null>(null)

  const [lastTrigger, setLastTrigger] = useState(triggerNuevo)
  if (triggerNuevo !== undefined && triggerNuevo !== lastTrigger) {
    setLastTrigger(triggerNuevo)
    setEditing(null)
    setFormOpen(true)
  }

  const rol = useAuthStore((s) => s.user?.rol)
  const canManage = !rol || rol === 'administrador' || rol === 'almacen'

  const params = useMemo<MarcaParams>(() => {
    const p: MarcaParams = { ...pagination.params }
    if (showInactivas) p.activo = 'false'
    return p
  }, [pagination.params, showInactivas])

  const { marcas, count, isLoading, isError, error, refetch } = useMarcas(params)

  const desactivar = useDesactivarMarca(estadoTarget?.id ?? null)
  const reactivar = useReactivarMarca(estadoTarget?.id ?? null)

  const abrirNueva = () => {
    setEditing(null)
    setFormOpen(true)
  }

  const abrirEdicion = (marca: Marca) => {
    setEditing(marca)
    setFormOpen(true)
  }

  const confirmarToggleEstado = async () => {
    if (!estadoTarget) return
    if (estadoTarget.activo) await desactivar.mutateAsync()
    else await reactivar.mutateAsync({ activo: true })
    setEstadoTarget(null)
  }

  const esInactiva = estadoTarget != null && !estadoTarget.activo

  return (
    <div className="space-y-4">
      <MarcasTable
        marcas={marcas}
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
        showInactivas={showInactivas}
        onToggleInactivas={(value) => {
          setShowInactivas(value)
          pagination.resetPage()
        }}
        canManage={canManage}
        onEdit={abrirEdicion}
        onToggleEstado={setEstadoTarget}
        onNuevo={abrirNueva}
      />

      <MarcaFormDialog open={formOpen} onOpenChange={setFormOpen} marca={editing} />

      <ConfirmDialog
        open={estadoTarget != null}
        onOpenChange={(open) => {
          if (!open) setEstadoTarget(null)
        }}
        title={esInactiva ? '¿Reactivar esta marca?' : '¿Desactivar esta marca?'}
        description={
          esInactiva
            ? `${estadoTarget?.nombre} volverá a estar disponible para nuevos productos.`
            : `${estadoTarget?.nombre} dejará de poder asignarse a productos. Sus productos asociados se conservan.`
        }
        confirmLabel={esInactiva ? 'Reactivar' : 'Desactivar'}
        variant={esInactiva ? 'default' : 'destructive'}
        loading={desactivar.isPending || reactivar.isPending}
        onConfirm={confirmarToggleEstado}
      />
    </div>
  )
}
