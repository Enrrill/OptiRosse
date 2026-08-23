import { useMemo, useState } from 'react'
import { useAuthStore } from '@/store/useAuth'
import { useDebounce } from '@/hooks/useDebounce'
import { ConfirmDialog } from '@/components/forms/ConfirmDialog'
import { useCategorias } from '../hooks/useCategorias'
import { useDesactivarCategoria, useReactivarCategoria } from '../hooks/useCategoriaMutations'
import { CategoriasTable } from './CategoriasTable'
import { CategoriaFormDialog } from './CategoriaFormDialog'
import type { Categoria } from '@/types/models'

interface CategoriasTabProps {
  triggerNuevo?: number
}

export function CategoriasTab({ triggerNuevo }: CategoriasTabProps) {
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)
  const [showInactivas, setShowInactivas] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Categoria | null>(null)
  const [estadoTarget, setEstadoTarget] = useState<Categoria | null>(null)

  const [lastTrigger, setLastTrigger] = useState(triggerNuevo)
  if (triggerNuevo !== undefined && triggerNuevo !== lastTrigger) {
    setLastTrigger(triggerNuevo)
    setEditing(null)
    setFormOpen(true)
  }

  const rol = useAuthStore((s) => s.user?.rol)
  const canManage = rol === 'administrador' || rol === 'almacen'

  const params = useMemo(
    () => ({
      ...(debouncedSearch ? { search: debouncedSearch } : {}),
      ...(showInactivas ? { activo: 'false' as const } : {}),
    }),
    [debouncedSearch, showInactivas],
  )

  const { categorias, isLoading, isError, error, refetch } = useCategorias(params)

  const desactivar = useDesactivarCategoria(estadoTarget?.id ?? null)
  const reactivar = useReactivarCategoria(estadoTarget?.id ?? null)

  const abrirNueva = () => {
    setEditing(null)
    setFormOpen(true)
  }

  const abrirEdicion = (categoria: Categoria) => {
    setEditing(categoria)
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
      <CategoriasTable
        categorias={categorias}
        isLoading={isLoading}
        isError={isError}
        errorMessage={error?.defaultMessage}
        onRetry={() => refetch()}
        search={search}
        onSearchChange={setSearch}
        showInactivas={showInactivas}
        onToggleInactivas={setShowInactivas}
        canManage={canManage}
        onEdit={abrirEdicion}
        onToggleEstado={setEstadoTarget}
        onNuevo={abrirNueva}
      />

      <CategoriaFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        categoria={editing}
      />

      <ConfirmDialog
        open={estadoTarget != null}
        onOpenChange={(open) => {
          if (!open) setEstadoTarget(null)
        }}
        title={esInactiva ? '¿Reactivar esta categoría?' : '¿Desactivar esta categoría?'}
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