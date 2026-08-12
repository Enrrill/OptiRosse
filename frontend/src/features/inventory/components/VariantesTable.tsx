import { DataTable, type Column } from '@/components/data/DataTable'
import { Pagination } from '@/components/data/Pagination'
import { StockBadge } from '@/components/data/StockBadge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Icon } from '@/components/Icon'
import { formatMoney } from '@/lib/format'
import type { Producto, VarianteProducto } from '@/types/models'

interface VariantesTableProps {
  variantes: VarianteProducto[]
  count: number
  page: number
  pageSize: number
  onPageChange: (page: number) => void
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
      cell: (row) => <span className="font-mono text-xs">{row.sku}</span>,
    },
    {
      key: 'producto',
      header: 'Producto',
      cell: (row) => <span className="font-medium text-on-surface">{productoLabel(row)}</span>,
    },
    {
      key: 'color_tamano',
      header: 'Color / Tamaño',
      cell: (row) => {
        const texto = [row.color, row.tamano].filter(Boolean).join(' · ') || '—'
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
        <div className="flex flex-col gap-3 border-b border-outline-variant p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-sm">
              <Icon
                name="search"
                size={18}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
              />
              <Input
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Buscar por SKU, código de barras o marca..."
                className="pl-9"
              />
            </div>
            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-on-surface-variant">
              <Switch checked={soloStockBajo} onCheckedChange={onToggleSoloStockBajo} />
              Solo stock bajo
            </label>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Select
              value={productoFiltro != null ? String(productoFiltro) : 'todos'}
              onValueChange={(value) =>
                onProductoChange(value === 'todos' ? null : Number(value))
              }
            >
              <SelectTrigger className="w-full sm:w-56">
                <SelectValue placeholder="Producto" />
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
      footer={<Pagination page={page} pageSize={pageSize} count={count} onPageChange={onPageChange} />}
    />
  )
}