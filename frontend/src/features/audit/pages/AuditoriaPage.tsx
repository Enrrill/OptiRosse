import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'
import { PageHeader } from '@/components/data/PageHeader'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/Icon'
import { usePagination } from '@/hooks/usePagination'
import { choice, TABLA_AUDITORIA } from '@/lib/constants/choices'
import type { RegistroAuditoria } from '@/types/models'
import {
  useRegistrosAuditoria,
  type RegistroAuditoriaParams,
} from '../hooks/useRegistrosAuditoria'
import { useUsuariosOpciones } from '../hooks/useUsuariosOpciones'
import { AuditoriaTable } from '../components/AuditoriaTable'
import { RegistroDetalleDialog } from '../components/RegistroDetalleDialog'

const leerId = (value: string | null): number | null => {
  if (!value || !/^\d+$/.test(value)) return null
  return Number(value)
}

export default function AuditoriaPage() {
  const pagination = usePagination()
  const [searchParams] = useSearchParams()
  const [usuarioFiltro, setUsuarioFiltro] = useState<number | null>(() =>
    leerId(searchParams.get('usuario')),
  )
  const [tablaFiltro, setTablaFiltro] = useState(() => searchParams.get('tabla') ?? '')
  const [objetoFiltro, setObjetoFiltro] = useState<number | null>(() =>
    leerId(searchParams.get('objeto_id')),
  )
  const [accionFiltro, setAccionFiltro] = useState('')
  const [fechaDesde, setFechaDesde] = useState('')
  const [fechaHasta, setFechaHasta] = useState('')
  const [detalle, setDetalle] = useState<RegistroAuditoria | null>(null)

  const { usuarios } = useUsuariosOpciones()

  const params = useMemo<RegistroAuditoriaParams>(() => {
    const p: RegistroAuditoriaParams = { ...pagination.params }
    if (usuarioFiltro != null) p.usuario = usuarioFiltro
    if (tablaFiltro) p.tabla = tablaFiltro
    if (objetoFiltro != null) p.objeto_id = objetoFiltro
    if (accionFiltro) p.accion = accionFiltro
    if (fechaDesde) p.fecha_creado_after = fechaDesde
    if (fechaHasta) p.fecha_creado_before = fechaHasta
    return p
  }, [pagination.params, usuarioFiltro, tablaFiltro, objetoFiltro, accionFiltro, fechaDesde, fechaHasta])

  const { registros, count, isLoading, isError, error, refetch } = useRegistrosAuditoria(params)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Auditoría"
        description="Registro de las acciones realizadas por el personal: quién hizo qué, en qué módulo y cuándo."
      />

      {objetoFiltro != null && (
        <div className="flex items-center gap-3 rounded-xl border border-primary/30 bg-primary-container/10 px-4 py-3">
          <Icon name="history" size={20} className="text-primary" />
          <p className="text-sm text-on-surface">
            Historial del registro{' '}
            <span className="font-mono font-semibold">
              {choice(TABLA_AUDITORIA, tablaFiltro)?.label ?? tablaFiltro} #{objetoFiltro}
            </span>
          </p>
          <Button
            variant="outline"
            size="sm"
            className="ml-auto"
            onClick={() => {
              setObjetoFiltro(null)
              setTablaFiltro('')
              pagination.resetPage()
            }}
          >
            <Icon name="close" size={16} /> Quitar filtro
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
              Registros totales
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-container text-on-primary-container">
              <Icon name="history" size={20} />
            </div>
          </div>
          <p className="mt-2 font-heading text-3xl font-bold text-on-surface">{count}</p>
          <p className="mt-1 text-xs text-on-surface-variant">Acciones registradas en el sistema</p>
        </div>
      </div>

      <AuditoriaTable
        registros={registros}
        count={count}
        page={pagination.page}
        pageSize={pagination.pageSize}
        onPageChange={pagination.setPage}
        isLoading={isLoading}
        isError={isError}
        errorMessage={error?.defaultMessage}
        onRetry={() => refetch()}
        search={pagination.search}
        onSearchChange={(value) => {
          pagination.setSearch(value)
          pagination.resetPage()
        }}
        usuarios={usuarios}
        usuarioFiltro={usuarioFiltro}
        onUsuarioChange={(value) => {
          setUsuarioFiltro(value)
          pagination.resetPage()
        }}
        accionFiltro={accionFiltro}
        onAccionChange={(value) => {
          setAccionFiltro(value)
          pagination.resetPage()
        }}
        tablaFiltro={tablaFiltro}
        onTablaChange={(value) => {
          setTablaFiltro(value)
          pagination.resetPage()
        }}
        fechaDesde={fechaDesde}
        onFechaDesdeChange={(value) => {
          setFechaDesde(value)
          pagination.resetPage()
        }}
        fechaHasta={fechaHasta}
        onFechaHastaChange={(value) => {
          setFechaHasta(value)
          pagination.resetPage()
        }}
        onVerDetalle={setDetalle}
      />

      <RegistroDetalleDialog
        registro={detalle}
        onOpenChange={(open) => {
          if (!open) setDetalle(null)
        }}
      />
    </div>
  )
}