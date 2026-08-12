import { useMemo, useState } from 'react'
import { useDebounce } from '@/hooks/useDebounce'
import { usePagination } from '@/hooks/usePagination'
import { useAuthStore } from '@/store/useAuth'
import { ConfirmDialog } from '@/components/forms/ConfirmDialog'
import type { PaginationParams } from '@/types/api'
import { useProductos } from '../hooks/useProductos'
import { useCategorias } from '../hooks/useCategorias'
import { useDesactivarProducto, useReactivarProducto } from '../hooks/useProductoMutations'
import { ProductosTable } from './ProductosTable'
import { ProductoFormDrawer } from './ProductoFormDrawer'
import type { Producto } from '@/types/models'

export function ProductosTab() {
  const pagination = usePagination()
  const [tipoFiltro, setTipoFiltro] = useState('')
  const [categoriaFiltro, setCategoriaFiltro] = useState<number | null>(null)
  const [marcaFiltro, setMarcaFiltro] = useState('')
  const marcaDebounced = useDebounce(marcaFiltro, 300)
  const [showInactivos, setShowInactivos] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Producto | null>(null)
  const [estadoTarget, setEstadoTarget] = useState<Producto | null>(null)

  const rol = useAuthStore((s) => s.user?.rol)
  const canManage = rol === 'administrador' || rol === 'almacen'

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
      <ProductosTable
        productos={productos}
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
        tipoFiltro={tipoFiltro}
        onTipoChange={(value) => {
          setTipoFiltro(value)
          pagination.resetPage()
        }}
        categoriaFiltro={categoriaFiltro}
        onCategoriaChange={(value) => {
          setCategoriaFiltro(value)
          pagination.resetPage()
        }}
        marcaFiltro={marcaFiltro}
        onMarcaChange={(value) => {
          setMarcaFiltro(value)
          pagination.resetPage()
        }}
        categorias={categorias}
        showInactivos={showInactivos}
        onToggleInactivos={(value) => {
          setShowInactivos(value)
          pagination.resetPage()
        }}
        canManage={canManage}
        onEdit={abrirEdicion}
        onToggleEstado={setEstadoTarget}
        onNuevo={abrirNuevo}
      />

      <ProductoFormDrawer open={formOpen} onOpenChange={setFormOpen} producto={editing} />

      <ConfirmDialog
        open={estadoTarget != null}
        onOpenChange={(open) => {
          if (!open) setEstadoTarget(null)
        }}
        title={esInactivo ? '¿Reactivar este producto?' : '¿Desactivar este producto?'}
        description={
          esInactivo
            ? `${estadoTarget?.marca} ${estadoTarget?.codigo_modelo} volverá a estar disponible en el inventario.`
            : `${estadoTarget?.marca} ${estadoTarget?.codigo_modelo} dejará de aparecer en las listas por defecto. Sus variantes y movimientos se conservan.`
        }
        confirmLabel={esInactivo ? 'Reactivar' : 'Desactivar'}
        variant={esInactivo ? 'default' : 'destructive'}
        loading={desactivar.isPending || reactivar.isPending}
        onConfirm={confirmarToggleEstado}
      />
    </div>
  )
}