import { DataTable, type Column } from '@/components/data/DataTable'
import { DataTableToolbar } from '@/components/data/DataTableToolbar'
import { Pagination } from '@/components/data/Pagination'
import { StatusBadge } from '@/components/data/StatusBadge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Icon } from '@/components/Icon'
import { choice, estadoActivo, TIPO_PRODUCTO } from '@/lib/constants/choices'
import { FilterChip } from '@/components/ui/FilterChip'
import { formatNumber } from '@/lib/format'
import type { Categoria, Producto } from '@/types/models'

interface ProductosTableProps {
  productos: Producto[]
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
  tipoFiltro: string
  onTipoChange: (value: string) => void
  categoriaFiltro: number | null
  onCategoriaChange: (value: number | null) => void
  marcaFiltro: string
  onMarcaChange: (value: string) => void
  categorias: Categoria[]
  showInactivos: boolean
  onToggleInactivos: (value: boolean) => void
  canManage: boolean
  onEdit: (producto: Producto) => void
  onToggleEstado: (producto: Producto) => void
  onNuevo: () => void
}

export function ProductosTable({
  productos,
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
  tipoFiltro,
  onTipoChange,
  categoriaFiltro,
  onCategoriaChange,
  marcaFiltro,
  onMarcaChange,
  categorias,
  showInactivos,
  onToggleInactivos,
  canManage,
  onEdit,
  onToggleEstado,
  onNuevo,
}: ProductosTableProps) {
  const columns: Column<Producto>[] = [
    {
      key: 'marca',
      header: 'Producto',
      cell: (row) => (
        <div>
          <p className="font-medium text-on-surface">
            {row.marca} <span className="font-mono text-on-surface-variant">{row.codigo_modelo}</span>
          </p>
          <p className="max-w-[260px] truncate text-xs text-on-surface-variant">{row.descripcion}</p>
        </div>
      ),
    },
    {
      key: 'categoria_detalle',
      header: 'Categoría',
      cell: (row) => <span>{row.categoria_detalle.nombre}</span>,
    },
    {
      key: 'tipo',
      header: 'Tipo',
      cell: (row) => (
        <StatusBadge display={choice(TIPO_PRODUCTO, row.categoria_detalle.tipo_producto)} />
      ),
    },
    {
      key: 'variantes_count',
      header: 'Variantes',
      align: 'right',
      cell: (row) => (
        <div className="text-right">
          <span className="font-mono text-sm font-semibold">
            {formatNumber(row.variantes.length)}
          </span>
        </div>
      ),
    },
    {
      key: 'estado',
      header: 'Estado',
      cell: (row) => <StatusBadge display={estadoActivo(row.activo)} />,
    },
    {
      key: 'acciones',
      header: 'Acciones',
      align: 'right',
      cell: (row) =>
        canManage ? (
          <div className="flex items-center justify-end gap-0.5">
            <TooltipProvider delayDuration={150}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Editar producto"
                    onClick={() => onEdit(row)}
                  >
                    <Icon name="edit" size={18} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Editar</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={row.activo ? 'Desactivar producto' : 'Reactivar producto'}
                    onClick={() => onToggleEstado(row)}
                  >
                    <Icon name={row.activo ? 'visibility_off' : 'restart_alt'} size={18} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{row.activo ? 'Desactivar' : 'Reactivar'}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        ) : null,
    },
  ]

  const activeCount = [
    tipoFiltro !== '',
    categoriaFiltro !== null,
    marcaFiltro !== '',
  ].filter(Boolean).length

  const activeFiltersList = [
    tipoFiltro
      ? {
          id: 'tipo',
          label: 'Tipo',
          valueDisplay: choice(TIPO_PRODUCTO, tipoFiltro).label,
          onRemove: () => onTipoChange(''),
        }
      : null,
    categoriaFiltro !== null
      ? {
          id: 'categoria',
          label: 'Categoría',
          valueDisplay: categorias.find((c) => c.id === categoriaFiltro)?.nombre ?? String(categoriaFiltro),
          onRemove: () => onCategoriaChange(null),
        }
      : null,
    marcaFiltro
      ? {
          id: 'marca',
          label: 'Marca',
          valueDisplay: marcaFiltro,
          onRemove: () => onMarcaChange(''),
        }
      : null,
  ].filter(Boolean) as import('@/components/filters/ActiveFilterChips').ActiveFilterItem[]

  const handleClearFilters = () => {
    onTipoChange('')
    onCategoriaChange(null)
    onMarcaChange('')
  }

  return (
    <DataTable<Producto>
      columns={columns}
      data={productos}
      rowKey={(row) => row.id}
      loading={isLoading}
      error={isError ? (errorMessage ?? 'Ocurrió un error al cargar los productos') : null}
      onRetry={onRetry}
      emptyTitle={showInactivos ? 'No hay productos inactivos' : 'No hay productos'}
      emptyDescription="Registra tu primer producto con sus variantes (SKU, stock y precios)."
      emptyAction={
        canManage ? (
          <Button onClick={onNuevo}>
            <Icon name="add" size={18} /> Nuevo producto
          </Button>
        ) : undefined
      }
      toolbar={
        <DataTableToolbar
          search={search}
          onSearchChange={onSearchChange}
          searchPlaceholder="Buscar por marca, modelo o categoría..."
          searchId="search-productos"
          quickFilters={
            canManage ? (
              <FilterChip
                id="toggle-inactivos-productos"
                checked={showInactivos}
                onCheckedChange={onToggleInactivos}
              />
            ) : undefined
          }
          activeFilterCount={activeCount}
          activeFilters={activeFiltersList}
          onClearFilters={handleClearFilters}
          filterContent={
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-on-surface-variant">Tipo de producto</label>
                <Select
                  value={tipoFiltro || 'todos'}
                  onValueChange={(value) => onTipoChange(value === 'todos' ? '' : value)}
                >
                  <SelectTrigger className="w-full h-8.5 text-xs bg-surface-container-lowest border-outline-variant/80">
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
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-on-surface-variant">Categoría</label>
                <Select
                  value={categoriaFiltro != null ? String(categoriaFiltro) : 'todas'}
                  onValueChange={(value) =>
                    onCategoriaChange(value === 'todas' ? null : Number(value))
                  }
                >
                  <SelectTrigger className="w-full h-8.5 text-xs bg-surface-container-lowest border-outline-variant/80">
                    <SelectValue placeholder="Todas las categorías" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas las categorías</SelectItem>
                    {categorias.map((categoria) => (
                      <SelectItem key={categoria.id} value={String(categoria.id)}>
                        {categoria.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label htmlFor="search-marca" className="text-xs font-medium text-on-surface-variant">Marca</label>
                <Input
                  id="search-marca"
                  name="marca"
                  value={marcaFiltro}
                  onChange={(e) => onMarcaChange(e.target.value)}
                  placeholder="Filtrar por marca..."
                  className="h-8.5 text-xs bg-surface-container-lowest border-outline-variant/80"
                />
              </div>
            </div>
          }
        />
      }
      footer={<Pagination page={page} pageSize={pageSize} count={count} onPageChange={onPageChange} />}
    />
  )
}