import { DataTable, type Column } from '@/components/data/DataTable'
import { DataTableToolbar } from '@/components/data/DataTableToolbar'
import { Pagination } from '@/components/data/Pagination'
import { StockBadge } from '@/components/data/StockBadge'
import { Button } from '@/components/ui/button'
import { FilterChip } from '@/components/ui/FilterChip'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Icon } from '@/components/Icon'
import { formatMoney, formatName, formatSKU } from '@/lib/format'
import type { Producto, VarianteProducto } from '@/types/models'

interface VariantesTableProps {
  variantes: VarianteProducto[]
  count: number
  page: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
  isLoading: boolean
  isError: boolean
  errorMessage?: string
  onRetry: () => void
  search: string
  onSearchChange: (value: string) => void
  productoFiltro: number | null
  onProductoChange: (value: number | null) => void
  soloStockBajo: boolean
  onToggleSoloStockBajo: (value: boolean) => void
  productos: Producto[]
  canManage: boolean
  onAjustarStock: (variante: VarianteProducto) => void
}

function gradiente(row: VarianteProducto): string {
  const partes = [row.esfera, row.cilindro, row.eje]
    .filter((v): v is number | string => v !== null && v !== undefined && v !== '')
    .map((v) => (typeof v === 'number' ? String(v) : v))
  return partes.length ? partes.join(' / ') : '—'
}

export function VariantesTable({
  variantes,
  count,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  isLoading,
  isError,
  errorMessage,
  onRetry,
  search,
  onSearchChange,
  productoFiltro,
  onProductoChange,
  soloStockBajo,
  onToggleSoloStockBajo,
  productos,
  canManage,
  onAjustarStock,
}: VariantesTableProps) {
  const productoLabel = (row: VarianteProducto): string => {
    const encontrado = productos.find((p) => p.id === row.producto)
    return encontrado ? `${encontrado.marca} ${encontrado.codigo_modelo}`.trim() : `Producto #${row.producto}`
  }

  const columns: Column<VarianteProducto>[] = [
    {
      key: 'stock',
      header: 'Stock',
      cell: (row) => (
        <StockBadge stock={row.stock} alertaMinima={row.alerta_stock_minimo} />
      ),
    },
    {
      key: 'sku',
      header: 'SKU',
      cell: (row) => <span className="font-mono text-xs font-semibold">{formatSKU(row.sku)}</span>,
    },
    {
      key: 'producto',
      header: 'Producto',
      cell: (row) => <span className="font-medium text-on-surface">{formatName(productoLabel(row))}</span>,
    },
    {
      key: 'color_tamano',
      header: 'Color / Tamaño',
      cell: (row) => {
        const color = formatName(row.color)
        const tamano = formatName(row.tamano)
        const partes = [color !== '—' ? color : '', tamano !== '—' ? tamano : ''].filter(Boolean)
        const texto = partes.join(' · ') || '—'
        return <span className="text-on-surface-variant">{texto}</span>
      },
    },
    {
      key: 'gradiente',
      header: 'Gradiente óptico',
      cell: (row) => <span className="font-mono text-xs text-on-surface-variant">{gradiente(row)}</span>,
    },
    {
      key: 'precio_al_mayor',
      header: 'Precio mayor',
      align: 'right',
      cell: (row) => formatMoney(row.precio_al_mayor),
    },
    {
      key: 'precio_costo',
      header: 'Precio costo',
      align: 'right',
      cell: (row) => formatMoney(row.precio_costo),
    },
    {
      key: 'acciones',
      header: 'Acciones',
      align: 'right',
      cell: (row) =>
        canManage ? (
          <div className="flex items-center justify-end">
            <TooltipProvider delayDuration={150}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onAjustarStock(row)}
                  >
                    <Icon name="swap_vert" size={16} /> Ajustar
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Ajustar stock</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        ) : null,
    },
  ]

  const activeCount = productoFiltro !== null ? 1 : 0

  const activeFiltersList = [
    productoFiltro !== null
      ? {
          id: 'producto',
          label: 'Producto',
          valueDisplay: (() => {
            const prod = productos.find((p) => p.id === productoFiltro)
            return prod ? `${prod.marca} ${prod.codigo_modelo}` : String(productoFiltro)
          })(),
          onRemove: () => onProductoChange(null),
        }
      : null,
  ].filter(Boolean) as import('@/components/filters/ActiveFilterChips').ActiveFilterItem[]

  const handleClearFilters = () => {
    onProductoChange(null)
  }

  return (
    <DataTable<VarianteProducto>
      columns={columns}
      data={variantes}
      rowKey={(row) => row.id}
      loading={isLoading}
      error={isError ? (errorMessage ?? 'Ocurrió un error al cargar las variantes') : null}
      onRetry={onRetry}
      emptyTitle={soloStockBajo ? 'Sin variantes con stock bajo' : 'No hay variantes'}
      emptyDescription="Crea variantes desde un producto para comenzar a controlar el stock."
      toolbar={
        <DataTableToolbar
          search={search}
          onSearchChange={onSearchChange}
          searchPlaceholder="Buscar por SKU, código de barras o marca..."
          searchId="search-variantes"
          quickFilters={
            <FilterChip
              id="toggle-stock-bajo"
              checked={soloStockBajo}
              onCheckedChange={onToggleSoloStockBajo}
              chipText="Stock bajo"
              label="Filtrar por stock bajo"
              activeLabel="Mostrando solo stock bajo"
            />
          }
          activeFilterCount={activeCount}
          activeFilters={activeFiltersList}
          onClearFilters={handleClearFilters}
          filterContent={
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-on-surface-variant">Producto</label>
                <Select
                  value={productoFiltro != null ? String(productoFiltro) : 'todos'}
                  onValueChange={(value) =>
                    onProductoChange(value === 'todos' ? null : Number(value))
                  }
                >
                  <SelectTrigger className="w-full h-8.5 text-xs bg-surface-container-lowest border-outline-variant/80">
                    <SelectValue placeholder="Todos los productos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos los productos</SelectItem>
                    {productos.map((p) => (
                      <SelectItem key={p.id} value={String(p.id)}>
                        {p.marca} {p.codigo_modelo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          }
        />
      }
      footer={
        <Pagination
          page={page}
          pageSize={pageSize}
          count={count}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      }
    />
  )
}