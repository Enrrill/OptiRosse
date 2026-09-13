import type { ReactNode } from 'react'
import {
  useTable,
  stockFeatures,
  flexRender,
  type ColumnDef,
  type SortingState,
  type VisibilityState,
} from '@tanstack/react-table'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { SkeletonRows } from './SkeletonRows'
import { ErrorState } from './ErrorState'
import { EmptyState } from './EmptyState'

type AppFeatures = typeof stockFeatures

export type AppColumnDef<TData, TValue = unknown> = ColumnDef<
  AppFeatures,
  TData,
  TValue
>

interface DataTableProps<TData, TValue> {
  columns: AppColumnDef<TData, TValue>[]
  data: TData[]
  isLoading?: boolean
  error?: string | null
  onRetry?: () => void
  emptyTitle?: string
  emptyDescription?: string
  emptyAction?: ReactNode
  onRowClick?: (row: TData) => void
  toolbar?: ReactNode
  footer?: ReactNode
  className?: string
  embedded?: boolean
  enableSorting?: boolean
  enableColumnVisibility?: boolean
  enableRowSelection?: boolean
  columnCount?: number
}

export function DataTable<TData, TValue>({
  columns,
  data,
  isLoading,
  error,
  onRetry,
  emptyTitle = 'No hay resultados',
  emptyDescription,
  emptyAction,
  onRowClick,
  toolbar,
  footer,
  className,
  embedded = false,
  enableSorting = false,
  enableColumnVisibility = false,
  enableRowSelection = false,
  columnCount,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})

  const table = useTable({
    features: stockFeatures,
    data,
    columns,
    onSortingChange: enableSorting ? setSorting : undefined,
    onColumnVisibilityChange: enableColumnVisibility ? setColumnVisibility : undefined,
    onRowSelectionChange: enableRowSelection ? setRowSelection : undefined,
    state: {
      sorting: enableSorting ? sorting : undefined,
      columnVisibility: enableColumnVisibility ? columnVisibility : undefined,
      rowSelection: enableRowSelection ? rowSelection : undefined,
    },
  })

  const colCount = columnCount ?? columns.length

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
      {isLoading ? (
        <SkeletonRows columns={colCount} />
      ) : error ? (
        <ErrorState message={error} onRetry={onRetry} />
      ) : data.length === 0 ? (
        <EmptyState title={emptyTitle} description={emptyDescription} action={emptyAction} />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr
                  key={headerGroup.id}
                  className="border-b border-outline-variant/30 bg-surface-container-low/50"
                >
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className={cn(
                        'px-6 py-3 text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant/80',
                        header.column.columnDef.meta?.className,
                      )}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-outline-variant/30">
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className={cn(
                    'transition-colors hover:bg-surface-container-low/50',
                    onRowClick && 'cursor-pointer',
                    row.getIsSelected() && 'bg-primary-container/10',
                  )}
                  onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className={cn(
                        'px-6 py-3.5 text-sm text-on-surface',
                        cell.column.columnDef.meta?.className,
                      )}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
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
