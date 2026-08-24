import { DataTable, type Column } from '@/components/data/DataTable'
import { DataTableToolbar } from '@/components/data/DataTableToolbar'
import { DateRangePicker } from '@/components/filters/DateRangePicker'
import { Pagination } from '@/components/data/Pagination'
import { Icon } from '@/components/Icon'
import { Button } from '@/components/ui/button'
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
      header: 'Acciones',
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

  const activeCount = [
    usuarioFiltro !== null,
    accionFiltro !== '',
    tablaFiltro !== '',
    fechaDesde !== '',
    fechaHasta !== '',
  ].filter(Boolean).length

  const activeFiltersList = [
    usuarioFiltro !== null
      ? {
          id: 'usuario',
          label: 'Usuario',
          valueDisplay: usuarios.find((u) => u.id === usuarioFiltro)?.nombre_usuario ?? String(usuarioFiltro),
          onRemove: () => onUsuarioChange(null),
        }
      : null,
    accionFiltro
      ? {
          id: 'accion',
          label: 'Acción',
          valueDisplay: choice(ACCION_AUDITORIA, accionFiltro)?.label ?? accionFiltro,
          onRemove: () => onAccionChange(''),
        }
      : null,
    tablaFiltro
      ? {
          id: 'tabla',
          label: 'Módulo',
          valueDisplay: choice(TABLA_AUDITORIA, tablaFiltro)?.label ?? tablaFiltro,
          onRemove: () => onTablaChange(''),
        }
      : null,
    fechaDesde
      ? {
          id: 'fechaDesde',
          label: 'Desde',
          valueDisplay: fechaDesde,
          onRemove: () => onFechaDesdeChange(''),
        }
      : null,
    fechaHasta
      ? {
          id: 'fechaHasta',
          label: 'Hasta',
          valueDisplay: fechaHasta,
          onRemove: () => onFechaHastaChange(''),
        }
      : null,
  ].filter(Boolean) as import('@/components/filters/ActiveFilterChips').ActiveFilterItem[]

  const handleClearFilters = () => {
    onUsuarioChange(null)
    onAccionChange('')
    onTablaChange('')
    onFechaDesdeChange('')
    onFechaHastaChange('')
  }

  const hayFiltros = search !== '' || activeCount > 0

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
        <DataTableToolbar
          search={search}
          onSearchChange={onSearchChange}
          searchPlaceholder="Buscar por usuario, acción o módulo..."
          searchId="search-auditoria"
          activeFilterCount={activeCount}
          activeFilters={activeFiltersList}
          onClearFilters={handleClearFilters}
          filterContent={
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-on-surface-variant">Usuario</label>
                <Select
                  value={usuarioFiltro != null ? String(usuarioFiltro) : 'todos'}
                  onValueChange={(value) => onUsuarioChange(value === 'todos' ? null : Number(value))}
                >
                  <SelectTrigger className="w-full h-8.5 text-xs bg-surface-container-lowest border-outline-variant/80">
                    <SelectValue placeholder="Todos los usuarios" />
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
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-on-surface-variant">Acción</label>
                <Select
                  value={accionFiltro || 'todas'}
                  onValueChange={(value) => onAccionChange(value === 'todas' ? '' : value)}
                >
                  <SelectTrigger className="w-full h-8.5 text-xs bg-surface-container-lowest border-outline-variant/80">
                    <SelectValue placeholder="Todas las acciones" />
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
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-on-surface-variant">Módulo afectable</label>
                <Select
                  value={tablaFiltro || 'todas'}
                  onValueChange={(value) => onTablaChange(value === 'todas' ? '' : value)}
                >
                  <SelectTrigger className="w-full h-8.5 text-xs bg-surface-container-lowest border-outline-variant/80">
                    <SelectValue placeholder="Todos los módulos" />
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

              <DateRangePicker
                fechaDesde={fechaDesde}
                onFechaDesdeChange={onFechaDesdeChange}
                fechaHasta={fechaHasta}
                onFechaHastaChange={onFechaHastaChange}
                idPrefix="auditoria-fecha"
              />
            </div>
          }
        />
      }
      footer={<Pagination page={page} pageSize={pageSize} count={count} onPageChange={onPageChange} />}
    />
  )
}