import { Pencil, EyeOff, RotateCcw, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/data/StatusBadge'
import { StockBadge } from '@/components/data/StockBadge'
import { EmptyState } from '@/components/data/EmptyState'
import { Skeleton } from '@/components/ui/skeleton'
import { choice, estadoActivo, TIPO_PRODUCTO } from '@/lib/constants/choices'
import { formatMoney } from '@/lib/format'
import type { Producto } from '@/types/models'

interface ProductosCardGridProps {
  productos: Producto[]
  isLoading: boolean
  canManage: boolean
  onEdit: (producto: Producto) => void
  onToggleEstado: (producto: Producto) => void
  onNuevo: () => void
}

function ProductoCard({
  producto,
  canManage,
  onEdit,
  onToggleEstado,
}: {
  producto: Producto
  canManage: boolean
  onEdit: (p: Producto) => void
  onToggleEstado: (p: Producto) => void
}) {
  const variantes = producto.variantes ?? []
  const totalStock = variantes.reduce((sum, v) => sum + v.stock, 0)
  const minStock = variantes.length > 0 ? Math.min(...variantes.map((v) => v.alerta_stock_minimo)) : 0
  const precios = variantes.map((v) => Number(v.precio_al_mayor)).filter((p) => p > 0)
  const precioMin = precios.length > 0 ? Math.min(...precios) : 0
  const precioMax = precios.length > 0 ? Math.max(...precios) : 0

  const tipoBadge = choice(TIPO_PRODUCTO, producto.categoria_detalle?.tipo_producto)

  return (
    <div className="group relative flex flex-col rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-4 shadow-xs transition-all hover:shadow-md hover:border-primary/30">
      <div className="mb-3 flex items-start justify-between">
        <StatusBadge display={tipoBadge} />
        <StatusBadge display={estadoActivo(producto.activo)} />
      </div>

      <div className="mb-2">
        <h3 className="text-sm font-bold text-on-surface">
          {producto.marca} <span className="font-mono text-on-surface-variant">{producto.codigo_modelo}</span>
        </h3>
        {producto.descripcion && (
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-on-surface-variant">
            {producto.descripcion}
          </p>
        )}
      </div>

      <div className="mb-3">
        <span className="inline-flex items-center rounded-full bg-surface-container-high px-2 py-0.5 text-[10px] font-medium text-on-surface-variant">
          {producto.categoria_detalle?.nombre ?? '—'}
        </span>
      </div>

      <div className="mt-auto flex items-center justify-between border-t border-outline-variant/40 pt-3">
        <div className="flex items-center gap-3">
          <div className="text-center">
            <p className="text-lg font-bold text-on-surface">{variantes.length}</p>
            <p className="text-[10px] text-on-surface-variant">Variantes</p>
          </div>
          <div className="text-center">
            <StockBadge stock={totalStock} alertaMinima={minStock} />
            <p className="text-[10px] text-on-surface-variant">Stock</p>
          </div>
          {precios.length > 0 && (
            <div className="text-center">
              <p className="text-xs font-semibold text-on-surface">
                {precioMin === precioMax
                  ? formatMoney(precioMin)
                  : `${formatMoney(precioMin)} - ${formatMoney(precioMax)}`}
              </p>
              <p className="text-[10px] text-on-surface-variant">Precio</p>
            </div>
          )}
        </div>

        {canManage && (
          <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Editar producto"
              onClick={() => onEdit(producto)}
            >
              <Pencil size={16} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label={producto.activo ? 'Desactivar producto' : 'Reactivar producto'}
              onClick={() => onToggleEstado(producto)}
            >
              {producto.activo ? <EyeOff size={16} /> : <RotateCcw size={16} />}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

function CardSkeleton() {
  return (
    <div className="flex flex-col rounded-2xl border border-outline-variant/60 p-4">
      <div className="mb-3 flex items-start justify-between">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-5 w-16" />
      </div>
      <Skeleton className="mb-2 h-5 w-40" />
      <Skeleton className="mb-2 h-4 w-full" />
      <Skeleton className="mb-3 h-4 w-24" />
      <div className="mt-auto border-t border-outline-variant/40 pt-3">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-12" />
          <Skeleton className="h-8 w-12" />
          <Skeleton className="h-8 w-20" />
        </div>
      </div>
    </div>
  )
}

export function ProductosCardGrid({
  productos,
  isLoading,
  canManage,
  onEdit,
  onToggleEstado,
  onNuevo,
}: ProductosCardGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (productos.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title="No hay productos"
        description="Registra tu primer producto con sus variantes (SKU, stock y precios)."
        action={
          canManage ? (
            <Button onClick={onNuevo}>
              <Package size={18} /> Nuevo producto
            </Button>
          ) : undefined
        }
      />
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {productos.map((producto) => (
        <ProductoCard
          key={producto.id}
          producto={producto}
          canManage={canManage}
          onEdit={onEdit}
          onToggleEstado={onToggleEstado}
        />
      ))}
    </div>
  )
}
