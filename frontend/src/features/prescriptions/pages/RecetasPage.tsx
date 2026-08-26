import { useMemo, useState } from 'react'
import { PageHeader } from '@/components/data/PageHeader'
import { ConfirmDialog } from '@/components/forms/ConfirmDialog'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/Icon'
import { useAuthStore } from '@/store/useAuth'
import { usePagination } from '@/hooks/usePagination'
import type { PaginationParams } from '@/types/api'
import { useRecetas } from '../hooks/useRecetas'
import { useDesactivarReceta, useReactivarReceta } from '../hooks/useRecetaMutations'
import { RecetasTable } from '../components/RecetasTable'
import { RecetaFormDrawer } from '../components/RecetaFormDrawer'
import { puedeEditarRecetas } from '../permissions'
import type { RecetaOptica } from '@/types/models'

export default function RecetasPage() {
  const pagination = usePagination({ storageKey: 'recetas', pageSize: 8 })
  const [showInactivos, setShowInactivos] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<RecetaOptica | null>(null)
  const [estadoTarget, setEstadoTarget] = useState<RecetaOptica | null>(null)

  const rol = useAuthStore((s) => s.user?.rol)
  const canEdit = puedeEditarRecetas(rol)

  const params = useMemo<PaginationParams>(() => {
    const p: PaginationParams = { ...pagination.params }
    if (showInactivos) p.activo = 'false'
    return p
  }, [pagination.params, showInactivos])

  const { recetas, count, isLoading, isError, error, refetch } = useRecetas(params)

  const desactivar = useDesactivarReceta(estadoTarget?.id ?? null)
  const reactivar = useReactivarReceta(estadoTarget?.id ?? null)

  const abrirNuevo = () => {
    setEditing(null)
    setFormOpen(true)
  }

  const abrirEdicion = (receta: RecetaOptica) => {
    setEditing(receta)
    setFormOpen(true)
  }

  const confirmarToggleEstado = async () => {
    if (!estadoTarget) return
    if (estadoTarget.activo) await desactivar.mutateAsync()
    else await reactivar.mutateAsync({ activo: true })
    setEstadoTarget(null)
  }

  const esInactivo = estadoTarget != null && !estadoTarget.activo
  const nombrePaciente = estadoTarget?.nombre_paciente || 'el paciente'

  return (
    <div>
      <PageHeader
        title="Recetas ópticas"
        description="Graduaciones y prescripciones de los pacientes."
        actions={
          canEdit ? (
            <Button onClick={abrirNuevo}>
              <Icon name="add" size={18} /> Nueva receta
            </Button>
          ) : undefined
        }
      />

      <RecetasTable
        recetas={recetas}
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
        showInactivos={showInactivos}
        onToggleInactivos={(value) => {
          setShowInactivos(value)
          pagination.resetPage()
        }}
        canEdit={canEdit}
        onEdit={abrirEdicion}
        onToggleEstado={(receta) => setEstadoTarget(receta)}
        onNuevo={abrirNuevo}
      />

      <RecetaFormDrawer open={formOpen} onOpenChange={setFormOpen} receta={editing} />

      <ConfirmDialog
        open={estadoTarget != null}
        onOpenChange={(open) => {
          if (!open) setEstadoTarget(null)
        }}
        title={esInactivo ? '¿Reactivar esta receta?' : '¿Desactivar esta receta?'}
        description={
          esInactivo
            ? `La receta de ${nombrePaciente} volverá a estar disponible para asociarla a nuevos pedidos.`
            : `La receta de ${nombrePaciente} dejará de mostrarse por defecto en las listas y no podrá asociarse a nuevos pedidos. Sus registros se conservan.`
        }
        confirmLabel={esInactivo ? 'Reactivar' : 'Desactivar'}
        variant={esInactivo ? 'default' : 'destructive'}
        loading={desactivar.isPending || reactivar.isPending}
        onConfirm={confirmarToggleEstado}
      />
    </div>
  )
}