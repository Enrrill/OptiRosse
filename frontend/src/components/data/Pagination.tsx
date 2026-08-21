import { Button } from '@/components/ui/button'

interface PaginationProps {
  page: number
  pageSize: number
  count: number
  onPageChange: (page: number) => void
  pageRange?: number[]
}

export function Pagination({ page, pageSize, count, onPageChange, pageRange }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(count / pageSize))

  const from = count === 0 ? 0 : (page - 1) * pageSize + 1
  const to = Math.min(count, page * pageSize)

  const displayedPageRange = pageRange || getPageRange(page, totalPages)

  return (
    <div className="flex flex-col items-center justify-between gap-2 border-t border-outline-variant bg-surface-container-lowest px-4 py-3 sm:flex-row">
      <p className="text-sm text-outline">
        Mostrando {from}–{to} de {count}
      </p>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Anterior
        </Button>
        <span className="px-3 text-sm text-on-surface-variant">
          Página {page} de {totalPages}
        </span>

        {/* Números de página */}
        {displayedPageRange.map((pageNum) => (
          <Button
            key={pageNum}
            variant="outline"
            size="sm"
            disabled={pageNum === page}
            onClick={() => onPageChange(pageNum)}
          >
            {pageNum}
          </Button>
        ))}

        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Siguiente
        </Button>
      </div>
    </div>
  )
}

function getPageRange(currentPage: number, totalPages: number): number[] {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }

  const pages = new Set<number>()
  pages.add(1)
  for (let i = Math.max(1, currentPage - 2); i <= Math.min(totalPages, currentPage + 2); i++) {
    pages.add(i)
  }
  pages.add(totalPages)

  return Array.from(pages).sort((a, b) => a - b)
}
