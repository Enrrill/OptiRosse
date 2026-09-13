import { DataTable } from '@/components/data/DataTable'
import type { ColumnDef } from '@tanstack/react-table'
import { DataTableToolbar } from '@/components/data/DataTableToolbar'
import { DataTablePagination } from '@/components/data/DataTablePagination'
import { StatusBadge } from '@/components/data/StatusBadge'
import { Plus, Pencil, RotateCcw, UserX } from 'lucide-react'
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
import { choice, estadoActivo, ROLES } from '@/lib/constants/choices'
import { formatDate, formatEmail, formatName } from '@/lib/format'
import type { RolUsuario, Usuario } from '@/types/models'

interface UsuariosTableProps {
  usuarios: Usuario[]
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
  showInactivos: boolean
  onToggleInactivos: (value: boolean) => void
  rolFiltro: RolUsuario | ''
  onRolChange: (value: RolUsuario | '') => void
  currentUserId?: number
  onEdit: (usuario: Usuario) => void
  onToggleEstado: (usuario: Usuario) => void
  onNuevo: () => void
}

export function UsuariosTable({
  usuarios,
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
  showInactivos,
  onToggleInactivos,
  rolFiltro,
  onRolChange,
  currentUserId,
  onEdit,
  onToggleEstado,
  onNuevo,
}: UsuariosTableProps) {
  const nombreCompleto = (usuario: Usuario) =>
    formatName([usuario.nombre, usuario.apellido].filter(Boolean).join(' '))

  const columns: ColumnDef<Usuario>[] = [
    {
      accessorKey: 'nombre_usuario',
      header: 'Usuario',
      cell: ({row}) => (
        <div>
          <p className="font-mono text-sm font-medium text-on-surface">@{row.original.nombre_usuario}</p>
          <p className="text-xs text-on-surface-variant">{nombreCompleto(row.original) || '—'}</p>
        </div>
      ),
    },
    {
      accessorKey: 'correo',
      header: 'Correo',
      cell: ({row}) => (
        <span className="block max-w-[320px] truncate text-on-surface-variant">{formatEmail(row.original.correo)}</span>
      ),
    },
    {
      accessorKey: 'rol',
      header: 'Rol',
      cell: ({row}) => <StatusBadge display={choice(ROLES, row.original.rol)} />,
    },
    {
      accessorKey: 'estado',
      header: 'Estado',
      cell: ({row}) => <StatusBadge display={estadoActivo(row.original.activo)} />,
    },
    { accessorKey: 'creado_en', header: 'Creado', cell: ({row}) => formatDate(row.original.creado_en) },
    {
      id: 'acciones',
      header: 'Acciones',
      meta: { className: 'text-right' },
      cell: ({row}) => {
        const esMismoUsuario = row.original.id === currentUserId
        return (
          <div className="flex items-center justify-end gap-0.5">
            <TooltipProvider delayDuration={150}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Editar usuario"
                    onClick={(e) => {
                      e.stopPropagation()
                      onEdit(row.original)
                    }}
                  >
                    <Pencil size={18} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Editar</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className={esMismoUsuario ? 'cursor-not-allowed' : undefined}>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={esMismoUsuario}
                      aria-label={row.original.activo ? 'Desactivar usuario' : 'Reactivar usuario'}
                      onClick={(e) => {
                        e.stopPropagation()
                        onToggleEstado(row.original)
                      }}
                    >
                      {row.original.activo ? <UserX size={18} /> : <RotateCcw size={18} />}
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  {esMismoUsuario
                    ? 'No puedes desactivar tu propia cuenta'
                    : row.original.activo
                      ? 'Desactivar'
                      : 'Reactivar'}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )
      },
    },
  ]

  const activeCount = rolFiltro !== '' ? 1 : 0

  const activeFiltersList = [
    rolFiltro !== ''
      ? {
          id: 'rol',
          label: 'Rol',
          valueDisplay: choice(ROLES, rolFiltro).label,
          onRemove: () => onRolChange(''),
        }
      : null,
  ].filter(Boolean) as import('@/components/filters/ActiveFilterChips').ActiveFilterItem[]

  const handleClearFilters = () => {
    onRolChange('')
  }

  return (
    <DataTable<Usuario>
      columns={columns}
      data={usuarios}
      isLoading={isLoading}
      error={isError ? (errorMessage ?? 'Ocurrió un error al cargar los usuarios') : null}
      onRetry={onRetry}
      emptyTitle={showInactivos ? 'No hay usuarios inactivos' : 'No hay usuarios'}
      emptyDescription="Crea la primera cuenta para que tu equipo pueda acceder a la plataforma."
      emptyAction={
        <Button onClick={onNuevo}>
          <Plus size={18} /> Nuevo usuario
        </Button>
      }
      toolbar={
        <DataTableToolbar
          search={search}
          onSearchChange={onSearchChange}
          searchPlaceholder="Buscar por usuario, nombre o correo..."
          searchId="search-usuarios"
          quickFilters={
            <FilterChip
              id="toggle-inactivos-usuarios"
              checked={showInactivos}
              onCheckedChange={onToggleInactivos}
            />
          }
          activeFilterCount={activeCount}
          activeFilters={activeFiltersList}
          onClearFilters={handleClearFilters}
          filterContent={
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-on-surface-variant">Rol de usuario</label>
                <Select
                  value={rolFiltro || 'todos'}
                  onValueChange={(value) => onRolChange(value === 'todos' ? '' : (value as RolUsuario))}
                >
                  <SelectTrigger className="w-full h-8.5 text-xs bg-surface-container-lowest border-outline-variant/80">
                    <SelectValue placeholder="Todos los roles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos los roles</SelectItem>
                    {Object.entries(ROLES).map(([rol, display]) => (
                      <SelectItem key={rol} value={rol}>
                        {display.label}
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
        <DataTablePagination
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
