import { Icon } from '@/components/Icon'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

export interface PaginationProps {
  page: number
  pageSize: number
  count: number
  onPageChange: (page: number) => void
  showPageSizeSelector?: boolean
  pageSizeOptions?: number[]
  onPageSizeChange?: (pageSize: number) => void
  pageRange?: number[]
  variant?: 'default' | 'card'
  className?: string
}

export function Pagination({
  page,
  pageSize,
  count,
  onPageChange,
  showPageSizeSelector = false,
  pageSizeOptions = [10, 15, 25, 50, 100],
  onPageSizeChange,
  pageRange,
  variant = 'default',
  className,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(count / pageSize))

  const from = count === 0 ? 0 : (page - 1) * pageSize + 1
  const to = Math.min(count, page * pageSize)

  const paginationRange = pageRange ?? getPaginationRange(page, totalPages)

  const variantStyles =
    variant === 'card'
      ? 'rounded-xl border border-outline-variant/70 bg-surface-container-lowest shadow-xs'
      : 'border-t border-outline-variant/40 bg-surface-container-lowest'

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-between gap-3 px-4 py-3 sm:flex-row sm:px-6',
        variantStyles,
        className,
      )}
    >
      {/* Información de la paginación y selector de filas */}
      <div className="flex flex-wrap items-center gap-4">
        <p className="text-xs text-on-surface-variant font-medium">
          Mostrando{' '}
          <span className="font-semibold text-on-surface">{from}–{to}</span> de{' '}
          <span className="font-semibold text-on-surface">{count}</span> resultados
        </p>

        {showPageSizeSelector && onPageSizeChange && (
          <div className="flex items-center gap-2 text-xs text-on-surface-variant">
            <span className="hidden sm:inline font-medium">Filas por página:</span>
            <Select
              value={String(pageSize)}
              onValueChange={(val) => {
                onPageSizeChange(Number(val))
                onPageChange(1)
              }}
            >
              <SelectTrigger className="h-8 w-[72px] text-xs rounded-lg border-outline-variant/60 bg-surface-container-lowest py-0 px-2 font-medium">
                <SelectValue placeholder={String(pageSize)} />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((opt) => (
                  <SelectItem key={opt} value={String(opt)} className="text-xs font-medium">
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Controles de navegación */}
      <div className="flex items-center gap-1.5">
        {/* Ir a la primera página */}
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(1)}
          title="Primera página"
          className="h-8 w-8 p-0 rounded-lg border-outline-variant/60 bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container hover:text-on-surface disabled:opacity-40 disabled:hover:bg-surface-container-lowest"
        >
          <Icon name="first_page" size={18} />
        </Button>

        {/* Página anterior */}
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          title="Página anterior"
          className="h-8 w-8 p-0 rounded-lg border-outline-variant/60 bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container hover:text-on-surface disabled:opacity-40 disabled:hover:bg-surface-container-lowest"
        >
          <Icon name="chevron_left" size={18} />
        </Button>

        {/* Números de página */}
        <div className="flex items-center gap-1">
          {paginationRange.map((item, idx) => {
            if (item === 'ellipsis') {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="flex h-8 w-7 items-center justify-center text-xs font-medium text-on-surface-variant/60 select-none"
                >
                  ...
                </span>
              )
            }

            const pageNum = item as number
            const isActive = pageNum === page

            return (
              <button
                key={pageNum}
                type="button"
                onClick={() => onPageChange(pageNum)}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'flex h-8 min-w-[32px] items-center justify-center rounded-lg px-2.5 text-xs font-medium transition-all duration-150',
                  isActive
                    ? 'bg-primary text-on-primary font-semibold shadow-xs ring-2 ring-primary/20 scale-[1.02]'
                    : 'border border-outline-variant/60 bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container hover:text-on-surface',
                )}
              >
                {pageNum}
              </button>
            )
          })}
        </div>

        {/* Página siguiente */}
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          title="Página siguiente"
          className="h-8 w-8 p-0 rounded-lg border-outline-variant/60 bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container hover:text-on-surface disabled:opacity-40 disabled:hover:bg-surface-container-lowest"
        >
          <Icon name="chevron_right" size={18} />
        </Button>

        {/* Ir a la última página */}
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(totalPages)}
          title="Última página"
          className="h-8 w-8 p-0 rounded-lg border-outline-variant/60 bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container hover:text-on-surface disabled:opacity-40 disabled:hover:bg-surface-container-lowest"
        >
          <Icon name="last_page" size={18} />
        </Button>
      </div>
    </div>
  )
}

function getPaginationRange(
  currentPage: number,
  totalPages: number,
): (number | 'ellipsis')[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }

  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, 'ellipsis', totalPages]
  }

  if (currentPage >= totalPages - 3) {
    return [
      1,
      'ellipsis',
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ]
  }

  return [
    1,
    'ellipsis',
    currentPage - 1,
    currentPage,
    currentPage + 1,
    'ellipsis',
    totalPages,
  ]
}
