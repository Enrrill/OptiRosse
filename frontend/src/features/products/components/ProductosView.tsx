import { useMemo, useState } from 'react'
import { useDebounce } from '@/hooks/useDebounce'
import { usePagination } from '@/hooks/usePagination'
import { useAuthStore } from '@/store/useAuth'
import { ConfirmDialog } from '@/components/forms/ConfirmDialog'
import { ViewToggle, type ViewMode } from '@/components/ui/ViewToggle'
import { Input } from '@/components/ui/input'
import { FilterChip } from '@/components/ui/FilterChip'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { PaginationParams } from '@/types/api'
import { useProductos } from '../hooks/useProductos'
import { useCategorias } from '@/features/inventory/hooks/useCategorias'
import { useDesactivarProducto, useReactivarProducto } from '../hooks/useProductoMutations'
import { ProductosTable } from './ProductosTable'
import { ProductosCardGrid } from './ProductosCardGrid'
import { ProductoFormDrawer } from './ProductoFormDrawer'
import { TIPO_PRODUCTO } from '@/lib/constants/choices'
import type { Producto } from '@/types/models'

interface ProductosViewProps {
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
  triggerNuevo?: number
}

export function ProductosView({ viewMode, onViewModeChange, triggerNuevo }: ProductosViewProps) {
  const pagination = usePagination({ storageKey: 'productos', pageSize: 12 })
  const [tipoFiltro, setTipoFiltro] = useState('')
  const [categoriaFiltro, setCategoriaFiltro] = useState<number | null>(null)
  const [marcaFiltro, setMarcaFiltro] = useState('')
  const marcaDebounced = useDebounce(marcaFiltro, 300)
  const [showInactivos, setShowInactivos] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Producto | null>(null)
  const [estadoTarget, setEstadoTarget] = useState<Producto | null>(null)

  const [lastTrigger, setLastTrigger] = useState(triggerNuevo)
  if (triggerNuevo !== undefined && triggerNuevo !== lastTrigger) {
    setLastTrigger(triggerNuevo)
    setEditing(null)
    setFormOpen(true)
  }

  const rol = useAuthStore((s) => s.user?.rol)
  const canManage = rol === 'administrador' || rol === 'empleado'

  const params = useMemo<PaginationParams>(() => {
    const p: PaginationParams = { ...pagination.params }
    if (tipoFiltro) p.tipo = tipoFiltro
    if (categoriaFiltro != null) p.categoria = categoriaFiltro
    if (marcaDebounced) p.marca = marcaDebounced
    if (showInactivos) p.activo = 'false'
    return p
  }, [pagination.params, tipoFiltro, categoriaFiltro, marcaDebounced, showInactivos])

  const { productos, count, isLoading, isError, error, refetch } = useProductos(params)
  const { categorias } = useCategorias()

  const desactivar = useDesactivarProducto(estadoTarget?.id ?? null)
  const reactivar = useReactivarProducto(estadoTarget?.id ?? null)

  const abrirNuevo = () => {
    setEditing(null)
    setFormOpen(true)
  }

  const abrirEdicion = (producto: Producto) => {
    setEditing(producto)
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
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
          <Input
            id="search-productos"
            value={pagination.search}
            onChange={(e) => { pagination.setSearch(e.target.value); pagination.resetPage() }}
            placeholder="Buscar por marca, modelo o categoría..."
            className="h-9 max-w-sm text-sm"
          />
          <div className="flex items-center gap-2">
            <Select
              value={tipoFiltro || 'todos'}
              onValueChange={(value) => { setTipoFiltro(value === 'todos' ? '' : value); pagination.resetPage() }}
            >
              <SelectTrigger className="h-9 w-[140px] text-xs">
                <SelectValue placeholder="Todos los tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los tipos</SelectItem>
                {Object.entries(TIPO_PRODUCTO).map(([tipo, display]) => (
                  <SelectItem key={tipo} value={tipo}>
                    {display.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={categoriaFiltro != null ? String(categoriaFiltro) : 'todas'}
              onValueChange={(value) => { setCategoriaFiltro(value === 'todas' ? null : Number(value)); pagination.resetPage() }}
            >
              <SelectTrigger className="h-9 w-[160px] text-xs">
                <SelectValue placeholder="Todas las categorías" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas las categorías</SelectItem>
                {categorias.map((cat) => (
                  <SelectItem key={cat.id} value={String(cat.id)}>
                    {cat.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              value={marcaFiltro}
              onChange={(e) => { setMarcaFiltro(e.target.value); pagination.resetPage() }}
              placeholder="Marca..."
              className="h-9 w-[120px] text-xs"
            />

            {canManage && (
              <FilterChip
                id="toggle-inactivos-productos"
                checked={showInactivos}
                onCheckedChange={(value) => { setShowInactivos(value); pagination.resetPage() }}
              />
            )}
          </div>
        </div>
        <ViewToggle viewMode={viewMode} onViewModeChange={onViewModeChange} />
      </div>

      {viewMode === 'table' ? (
        <ProductosTable
          productos={productos}
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
          onSearchChange={(value) => { pagination.setSearch(value); pagination.resetPage() }}
          tipoFiltro={tipoFiltro}
          onTipoChange={(value) => { setTipoFiltro(value); pagination.resetPage() }}
          categoriaFiltro={categoriaFiltro}
          onCategoriaChange={(value) => { setCategoriaFiltro(value); pagination.resetPage() }}
          marcaFiltro={marcaFiltro}
          onMarcaChange={(value) => { setMarcaFiltro(value); pagination.resetPage() }}
          categorias={categorias}
          showInactivos={showInactivos}
          onToggleInactivos={(value) => { setShowInactivos(value); pagination.resetPage() }}
          canManage={canManage}
          onEdit={abrirEdicion}
          onToggleEstado={setEstadoTarget}
          onNuevo={abrirNuevo}
        />
      ) : (
        <ProductosCardGrid
          productos={productos}
          isLoading={isLoading}
          canManage={canManage}
          onEdit={abrirEdicion}
          onToggleEstado={setEstadoTarget}
          onNuevo={abrirNuevo}
        />
      )}

      <ProductoFormDrawer open={formOpen} onOpenChange={setFormOpen} producto={editing} />

      <ConfirmDialog
        open={estadoTarget != null}
        onOpenChange={(open) => { if (!open) setEstadoTarget(null) }}
        title={esInactivo ? '¿Reactivar este producto?' : '¿Desactivar este producto?'}
        description={
          esInactivo
            ? `${estadoTarget?.marca} ${estadoTarget?.codigo_modelo} volverá a estar disponible.`
            : `${estadoTarget?.marca} ${estadoTarget?.codigo_modelo} dejará de aparecer en las listas por defecto.`
        }
        confirmLabel={esInactivo ? 'Reactivar' : 'Desactivar'}
        variant={esInactivo ? 'default' : 'destructive'}
        loading={desactivar.isPending || reactivar.isPending}
        onConfirm={confirmarToggleEstado}
      />
    </div>
  )
}
