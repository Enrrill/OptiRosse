import { DataTable, type Column } from '@/components/data/DataTable'
import { StatusBadge } from '@/components/data/StatusBadge'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Icon } from '@/components/Icon'
import { FilterChip } from '@/components/ui/FilterChip'
import { estadoActivo } from '@/lib/constants/choices'
import type { MetodoPago } from '@/types/models'

interface MetodosTableProps {
  metodos: MetodoPago[]
  isLoading: boolean
  isError: boolean
  errorMessage?: string
  onRetry: () => void
  search: string
  onSearchChange: (value: string) => void
  showInactivos: boolean
  onToggleInactivos: (value: boolean) => void
  onEdit: (metodo: MetodoPago) => void
  onToggleEstado: (metodo: MetodoPago) => void
  onNuevo: () => void
}

export function MetodosTable({
  metodos,
  isLoading,
  isError,
  errorMessage,
  onRetry,
  search,
  onSearchChange,
  showInactivos,
  onToggleInactivos,
  onEdit,
  onToggleEstado,
  onNuevo,
}: MetodosTableProps) {
  const columns: Column<MetodoPago>[] = [
    { key: 'nombre', header: 'Nombre', cell: (row) => <span className="font-medium">{row.nombre}</span> },
    { key: 'moneda', header: 'Moneda', cell: (row) => <span className="text-on-surface-variant">{row.moneda}</span> },
    {
      key: 'requiere_referencia',
      header: 'Requiere referencia',
      cell: (row) =>
        row.requiere_referencia ? (
          <Badge variant="neutral" className="bg-secondary-container/25 text-secondary">Sí</Badge>
        ) : (
          <Badge variant="neutral" className="bg-surface-variant/40 text-on-surface-variant">No</Badge>
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
      cell: (row) => (
        <div className="flex items-center justify-end gap-0.5">
          <TooltipProvider delayDuration={150}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Editar método de pago"
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
                  aria-label={row.activo ? 'Desactivar método de pago' : 'Reactivar método de pago'}
                  onClick={() => onToggleEstado(row)}
                >
                  <Icon name={row.activo ? 'visibility_off' : 'restart_alt'} size={18} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{row.activo ? 'Desactivar' : 'Reactivar'}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      ),
    },
  ]

  return (
    <DataTable<MetodoPago>
      columns={columns}
      data={metodos}
      rowKey={(row) => row.id}
      loading={isLoading}
      error={isError ? (errorMessage ?? 'Ocurrió un error al cargar los métodos de pago') : null}
      onRetry={onRetry}
      emptyTitle={showInactivos ? 'No hay métodos de pago inactivos' : 'No hay métodos de pago'}
      emptyDescription="Crea tu primer método de pago para registrar pagos."
      emptyAction={
        <Button onClick={onNuevo}>
          <Icon name="add" size={18} /> Nuevo método
        </Button>
      }
      toolbar={
        <div className="flex flex-col gap-3 border-b border-outline-variant p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-md">
            <Icon
              name="search"
              size={18}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
            />
            <Input
              id="search-metodos"
              name="search"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar por nombre o moneda..."
              className="pl-9"
            />
          </div>
          <FilterChip
            id="toggle-inactivos-metodos"
            checked={showInactivos}
            onCheckedChange={onToggleInactivos}
          />
        </div>
      }
    />
  )
}