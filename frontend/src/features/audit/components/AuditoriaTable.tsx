import { DataTable, type Column } from '@/components/data/DataTable'
import { Pagination } from '@/components/data/Pagination'
import { Icon } from '@/components/Icon'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { StatusBadge } from '@/components/data/StatusBadge'
import { choice, ACCION_AUDITORIA, TABLA_AUDITORIA } from '@/lib/constants/choices'
import { formatDateTime } from '@/lib/format'
import type { RegistroAuditoria, Usuario } from '@/types/models'

interface AuditoriaTableProps {
  registros: RegistroAuditoria[]
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
  usuarios: Usuario[]
  usuarioFiltro: number | null
  onUsuarioChange: (value: number | null) => void
  accionFiltro: string
  onAccionChange: (value: string) => void
  tablaFiltro: string
  onTablaChange: (value: string) => void
  fechaDesde: string
  onFechaDesdeChange: (value: string) => void
  fechaHasta: string
  onFechaHastaChange: (value: string) => void
  onVerDetalle: (registro: RegistroAuditoria) => void
}

const nombreUsuario = (registro: RegistroAuditoria): string => {
  const detalle = registro.usuario_detalle
  if (!detalle) return 'Sistema'
  return (
    [detalle.nombre, detalle.apellido].filter(Boolean).join(' ').trim() || detalle.nombre_usuario
  )
}

export function AuditoriaTable({
  registros,
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
  usuarios,
  usuarioFiltro,
  onUsuarioChange,
  accionFiltro,
  onAccionChange,
  tablaFiltro,
  onTablaChange,
  fechaDesde,
  onFechaDesdeChange,
  fechaHasta,
  onFechaHastaChange,
  onVerDetalle,
}: AuditoriaTableProps) {
  const columns: Column<RegistroAuditoria>[] = [
    {
      key: 'fecha',
      header: 'Fecha y hora',
      cell: (row) => (
        <span className="whitespace-nowrap text-on-surface-variant">{formatDateTime(row.creado_en)}</span>
      ),
    },
    {
      key: 'usuario',
      header: 'Usuario',
      cell: (row) => (
        <span className="font-medium text-on-surface">
          {nombreUsuario(row)}
          {row.usuario_detalle && (
            <span className="ml-1.5 text-xs text-on-surface-variant">@{row.usuario_detalle.nombre_usuario}</span>
          )}
        </span>
      ),
    },
    {
      key: 'accion',
      header: 'Acción',
      cell: (row) => <StatusBadge display={choice(ACCION_AUDITORIA, row.accion)} />,
    },
    {
      key: 'tabla',
      header: 'Módulo',
      cell: (row) => <StatusBadge display={choice(TABLA_AUDITORIA, row.tabla_afectada)} />,
    },
    {
      key: 'objeto',
      header: 'ID',
      cell: (row) =>
        row.objeto_id != null ? (
          <span className="font-mono text-sm text-primary">#{row.objeto_id}</span>
        ) : (
          <span className="text-on-surface-variant">—</span>
        ),
    },
    {
      key: 'ip',
      header: 'IP',
      cell: (row) => (
        <span className="font-mono text-sm text-on-surface-variant">{row.direccion_ip || '—'}</span>
      ),
    },
    {
      key: 'detalle',
      header: '',
      align: 'right',
      cell: (row) => (
        <Button
          variant="ghost"
          size="sm"
          type="button"
          onClick={() => onVerDetalle(row)}
          aria-label={`Ver detalle del registro ${row.id}`}
        >
          <Icon name="data_object" size={18} />
        </Button>
      ),
    },
  ]

  const hayFiltros =
    search !== '' ||
    usuarioFiltro != null ||
    accionFiltro !== '' ||
    tablaFiltro !== '' ||
    fechaDesde !== '' ||
    fechaHasta !== ''

  return (
    <DataTable<RegistroAuditoria>
      columns={columns}
      data={registros}
      rowKey={(row) => row.id}
      loading={isLoading}
      error={isError ? (errorMessage ?? 'Ocurrió un error al cargar la auditoría') : null}
      onRetry={onRetry}
      emptyTitle={hayFiltros ? 'No hay registros con estos filtros' : 'No hay registros de actividad'}
      emptyDescription="Las acciones del personal (crear, editar, desactivar, transiciones, pagos, documentos) quedarán registradas aquí."
      toolbar={
        <div className="flex flex-col gap-3 border-b border-outline-variant p-4">
          <div className="relative w-full sm:max-w-sm">
            <Icon
              name="search"
              size={18}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
            />
            <Input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar por usuario, acción o módulo..."
              className="pl-9"
            />
          </div>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <Select
              value={usuarioFiltro != null ? String(usuarioFiltro) : 'todos'}
              onValueChange={(value) => onUsuarioChange(value === 'todos' ? null : Number(value))}
            >
              <SelectTrigger className="w-full lg:w-52">
                <SelectValue placeholder="Usuario" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los usuarios</SelectItem>
                {usuarios.map((u) => (
                  <SelectItem key={u.id} value={String(u.id)}>
                    {u.nombre_usuario}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={accionFiltro || 'todas'} onValueChange={(value) => onAccionChange(value === 'todas' ? '' : value)}>
              <SelectTrigger className="w-full lg:w-52">
                <SelectValue placeholder="Acción" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas las acciones</SelectItem>
                {Object.entries(ACCION_AUDITORIA).map(([value, item]) => (
                  <SelectItem key={value} value={value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={tablaFiltro || 'todas'} onValueChange={(value) => onTablaChange(value === 'todas' ? '' : value)}>
              <SelectTrigger className="w-full lg:w-52">
                <SelectValue placeholder="Módulo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todos los módulos</SelectItem>
                {Object.entries(TABLA_AUDITORIA).map(([value, item]) => (
                  <SelectItem key={value} value={value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="flex items-center gap-2 text-sm text-on-surface-variant">
              Desde
              <Input
                type="date"
                value={fechaDesde}
                onChange={(e) => onFechaDesdeChange(e.target.value)}
                className="w-40"
              />
            </label>
            <label className="flex items-center gap-2 text-sm text-on-surface-variant">
              Hasta
              <Input
                type="date"
                value={fechaHasta}
                onChange={(e) => onFechaHastaChange(e.target.value)}
                className="w-40"
              />
            </label>
          </div>
        </div>
      }
      footer={<Pagination page={page} pageSize={pageSize} count={count} onPageChange={onPageChange} />}
    />
  )
}