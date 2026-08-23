import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { SkeletonRows } from './SkeletonRows'
import { ErrorState } from './ErrorState'
import { EmptyState } from './EmptyState'

export interface Column<T> {
  key: string
  header: string
  headerClassName?: string
  className?: string
  align?: 'left' | 'center' | 'right'
  cell?: (row: T) => ReactNode
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  rowKey: (row: T) => string | number
  loading?: boolean
  error?: string | null
  onRetry?: () => void
  emptyTitle?: string
  emptyDescription?: string
  emptyAction?: ReactNode
  onRowClick?: (row: T) => void
  toolbar?: ReactNode
  footer?: ReactNode
  className?: string
  embedded?: boolean
}

export function DataTable<T>({
  columns,
  data,
  rowKey,
  loading,
  error,
  onRetry,
  emptyTitle,
  emptyDescription,
  emptyAction,
  onRowClick,
  toolbar,
  footer,
  className,
  embedded = false,
}: DataTableProps<T>) {
  const alignClass = { left: 'text-left', center: 'text-center', right: 'text-right' }

  return (
    <div
      className={cn(
        embedded
          ? 'overflow-hidden bg-transparent'
          : 'overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm',
        className,
      )}
    >
      {toolbar}
      {loading ? (
        <SkeletonRows columns={columns.length} />
      ) : error ? (
        <ErrorState message={error} onRetry={onRetry} />
      ) : data.length === 0 ? (
        <EmptyState title={emptyTitle} description={emptyDescription} action={emptyAction} />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline-variant/30 bg-surface-container-low/50">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={cn(
                      'px-6 py-3 text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant/80',
                      alignClass[col.align ?? 'left'],
                      col.headerClassName,
                    )}
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30">
              {data.map((row) => (
                <tr
                  key={rowKey(row)}
                  className={cn(
                    'transition-colors hover:bg-surface-container-low/50',
                    onRowClick && 'cursor-pointer',
                  )}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn(
                        'px-6 py-3.5 text-sm text-on-surface',
                        alignClass[col.align ?? 'left'],
                        col.className,
                      )}
                    >
                      {col.cell
                        ? col.cell(row)
                        : ((row as unknown as Record<string, ReactNode>)[col.key] as ReactNode)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {footer}
    </div>
  )
}
