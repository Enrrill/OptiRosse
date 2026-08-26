import { useMemo, useState } from 'react'
import { usePagination } from '@/hooks/usePagination'
import { useAuthStore } from '@/store/useAuth'
import { useVariantes } from '../hooks/useVariantes'
import { useProductos } from '../hooks/useProductos'
import { VariantesTable } from './VariantesTable'
import { AjustarStockDialog } from './AjustarStockDialog'
import type { PaginationParams } from '@/types/api'
import type { VarianteProducto } from '@/types/models'

export function VariantesTab() {
  const pagination = usePagination({ storageKey: 'inventario-variantes', pageSize: 8 })
  const [productoFiltro, setProductoFiltro] = useState<number | null>(null)
  const [soloStockBajo, setSoloStockBajo] = useState(false)
  const [ajusteTarget, setAjusteTarget] = useState<VarianteProducto | null>(null)

  const rol = useAuthStore((s) => s.user?.rol)
  const canManage = rol === 'administrador' || rol === 'almacen'

  const params = useMemo<PaginationParams>(() => {
    const p: PaginationParams = { ...pagination.params }
    if (productoFiltro != null) p.producto = productoFiltro
    if (soloStockBajo) p.stock_bajo = true
    return p
  }, [pagination.params, productoFiltro, soloStockBajo])

  const { variantes, count, isLoading, isError, error, refetch } = useVariantes(params)
  const { productos } = useProductos({ page_size: 100, ordering: 'codigo_modelo' })

  return (
    <div className="space-y-4">
      <VariantesTable
        variantes={variantes}
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
        productoFiltro={productoFiltro}
        onProductoChange={(value) => {
          setProductoFiltro(value)
          pagination.resetPage()
        }}
        soloStockBajo={soloStockBajo}
        onToggleSoloStockBajo={(value) => {
          setSoloStockBajo(value)
          pagination.resetPage()
        }}
        productos={productos}
        canManage={canManage}
        onAjustarStock={setAjusteTarget}
      />

      <AjustarStockDialog
        open={ajusteTarget != null}
        onOpenChange={(open) => {
          if (!open) setAjusteTarget(null)
        }}
        variante={ajusteTarget}
      />
    </div>
  )
}