import { useMemo, useState } from 'react'
import { PageHeader } from '@/components/data/PageHeader'
import { ConfirmDialog } from '@/components/forms/ConfirmDialog'
import { Icon } from '@/components/Icon'
import { useAuthStore } from '@/store/useAuth'
import { usePagination } from '@/hooks/usePagination'
import { usePlantillas } from '../hooks/usePlantillas'
import { useDesactivarPlantilla, useReactivarPlantilla } from '../hooks/usePlantillaMutations'
import { PlantillasTable } from '../components/PlantillasTable'
import { PlantillaFormDialog } from '../components/PlantillaFormDialog'
import type { PlantillaDocumento, RolUsuario, TipoDocumento } from '@/types/models'
import { puedeGenerarDocumentos } from '@/lib/constants/permissions'

const ROLES_ESCRITURA: RolUsuario[] = ['administrador']

export default function DocumentosPage() {
  const pagination = usePagination()
  const [showInactivos, setShowInactivos] = useState(false)
  const [tipoFiltro, setTipoFiltro] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<PlantillaDocumento | null>(null)
  const [estadoTarget, setEstadoTarget] = useState<PlantillaDocumento | null>(null)

  const rol = useAuthStore((s) => s.user?.rol)
  const canEdit = !!rol && ROLES_ESCRITURA.includes(rol)

  const params = useMemo(() => {
    const p: Record<string, unknown> = { ...pagination.params }
    if (showInactivos) p.activo = 'false'
    if (tipoFiltro && tipoFiltro !== 'todos') p.tipo_documento = tipoFiltro as TipoDocumento
    return p
  }, [pagination.params, showInactivos, tipoFiltro])

  const { plantillas, count, isLoading, isError, error, refetch } = usePlantillas(params)

  const desactivar = useDesactivarPlantilla(estadoTarget?.id ?? null)
  const reactivar = useReactivarPlantilla(estadoTarget?.id ?? null)

  const abrirNuevo = () => {
    setEditing(null)
    setFormOpen(true)
  }

  const abrirEdicion = (plantilla: PlantillaDocumento) => {
    setEditing(plantilla)
    setFormOpen(true)
  }

  const confirmarToggleEstado = async () => {
    if (!estadoTarget) return
    try {
      if (estadoTarget.activo) await desactivar.mutateAsync()
      else await reactivar.mutateAsync({ activo: true })
      setEstadoTarget(null)
    } catch {
      setEstadoTarget(null)
    }
  }

  const esInactivo = estadoTarget != null && !estadoTarget.activo
  const nombrePlantilla = estadoTarget?.nombre || 'esta plantilla'

  return (
    <div>
      <PageHeader
        title="Documentos"
        description="Plantillas de documentos y generación de facturas, órdenes de trabajo, notas de entrega y recibos de pago."
      />

      <PlantillasTable
        plantillas={plantillas}
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
        tipoFiltro={tipoFiltro}
        onTipoChange={(value) => {
          setTipoFiltro(value)
          pagination.resetPage()
        }}
        canEdit={canEdit}
        onEdit={abrirEdicion}
        onToggleEstado={setEstadoTarget}
        onNuevo={abrirNuevo}
      />

      {puedeGenerarDocumentos(rol) && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-secondary-container/40 bg-secondary-container/10 px-4 py-3 text-sm text-on-surface">
          <Icon name="lightbulb" size={18} className="text-secondary" />
          <span>
            Genera documentos desde el detalle de un <b>pedido</b> (factura, orden de trabajo, nota
            de entrega) o de un <b>pago</b> (recibo).
          </span>
        </div>
      )}

      <PlantillaFormDialog open={formOpen} onOpenChange={setFormOpen} plantilla={editing} />

      <ConfirmDialog
        open={estadoTarget != null}
        onOpenChange={(open) => {
          if (!open) setEstadoTarget(null)
        }}
        title={esInactivo ? '¿Reactivar esta plantilla?' : '¿Desactivar esta plantilla?'}
        description={
          esInactivo
            ? `${nombrePlantilla} volverá a estar disponible para generar documentos.`
            : `${nombrePlantilla} dejará de poder usarse para generar documentos. La plantilla se conserva y puede reactivarse.`
        }
        confirmLabel={esInactivo ? 'Reactivar' : 'Desactivar'}
        variant={esInactivo ? 'default' : 'destructive'}
        loading={desactivar.isPending || reactivar.isPending}
        onConfirm={confirmarToggleEstado}
      />
    </div>
  )
}