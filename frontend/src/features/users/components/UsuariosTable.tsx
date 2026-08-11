import { DataTable, type Column } from '@/components/data/DataTable'
import { Pagination } from '@/components/data/Pagination'
import { StatusBadge } from '@/components/data/StatusBadge'
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
import { choice, estadoActivo, ROLES } from '@/lib/constants/choices'
import { formatDate } from '@/lib/format'
import type { RolUsuario, Usuario } from '@/types/models'

interface UsuariosTableProps {
  usuarios: Usuario[]
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
    [usuario.nombre, usuario.apellido].filter(Boolean).join(' ').trim()

  const columns: Column<Usuario>[] = [
    {
      key: 'nombre_usuario',
      header: 'Usuario',
      cell: (row) => (
        <div>
          <p className="font-mono text-sm font-medium text-on-surface">@{row.nombre_usuario}</p>
          <p className="text-xs text-on-surface-variant">{nombreCompleto(row) || '—'}</p>
        </div>
      ),
    },
    {
      key: 'correo',
      header: 'Correo',
      cell: (row) => (
        <span className="block max-w-[320px] truncate text-on-surface-variant">{row.correo}</span>
      ),
    },
    {
      key: 'rol',
      header: 'Rol',
      cell: (row) => <StatusBadge display={choice(ROLES, row.rol)} />,
    },
    {
      key: 'estado',
      header: 'Estado',
      cell: (row) => <StatusBadge display={estadoActivo(row.activo)} />,
    },
    { key: 'creado_en', header: 'Creado', cell: (row) => formatDate(row.creado_en) },
    {
      key: 'acciones',
      header: 'Acciones',
      align: 'right',
      cell: (row) => {
        const esMismoUsuario = row.id === currentUserId
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
                      onEdit(row)
                    }}
                  >
                    <Icon name="edit" size={18} />
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
                      aria-label={row.activo ? 'Desactivar usuario' : 'Reactivar usuario'}
                      onClick={(e) => {
                        e.stopPropagation()
                        onToggleEstado(row)
                      }}
                    >
                      <Icon name={row.activo ? 'person_off' : 'restart_alt'} size={18} />
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  {esMismoUsuario
                    ? 'No puedes desactivar tu propia cuenta'
                    : row.activo
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

  return (
    <DataTable<Usuario>
      columns={columns}
      data={usuarios}
      rowKey={(row) => row.id}
      loading={isLoading}
      error={isError ? (errorMessage ?? 'Ocurrió un error al cargar los usuarios') : null}
      onRetry={onRetry}
      emptyTitle={showInactivos ? 'No hay usuarios inactivos' : 'No hay usuarios'}
      emptyDescription="Crea la primera cuenta para que tu equipo pueda acceder a la plataforma."
      emptyAction={
        <Button onClick={onNuevo}>
          <Icon name="add" size={18} /> Nuevo usuario
        </Button>
      }
      toolbar={
        <div className="flex flex-col gap-3 border-b border-outline-variant p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-64">
              <Icon
                name="search"
                size={18}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
              />
              <Input
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Buscar por usuario, nombre o correo..."
                className="pl-9"
              />
            </div>
            <Select
              value={rolFiltro || 'todos'}
              onValueChange={(value) => onRolChange(value === 'todos' ? '' : (value as RolUsuario))}
            >
              <SelectTrigger className="w-full sm:w-48">
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
          <label className="flex cursor-pointer items-center gap-2 text-sm text-on-surface-variant">
            <Switch checked={showInactivos} onCheckedChange={onToggleInactivos} />
            Mostrar inactivos
          </label>
        </div>
      }
      footer={<Pagination page={page} pageSize={pageSize} count={count} onPageChange={onPageChange} />}
    />
  )
}
