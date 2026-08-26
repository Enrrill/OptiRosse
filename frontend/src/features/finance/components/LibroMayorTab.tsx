import { useMemo, useState } from 'react'
import { usePagination } from '@/hooks/usePagination'
import { useSaldoCliente } from '@/hooks/useSaldoCliente'
import { Icon } from '@/components/Icon'
import { formatMoney } from '@/lib/format'
import { useLibroMayor, type LibroMayorParams } from '../hooks/useLibroMayor'
import { useClientesOpciones } from '../hooks/useClientesOpciones'
import { LibroMayorTable } from './LibroMayorTable'

export function LibroMayorTab() {
  const pagination = usePagination({ storageKey: 'finanzas-libromayor', pageSize: 8 })
  const [clienteFiltro, setClienteFiltro] = useState<number | null>(null)
  const [tipoFiltro, setTipoFiltro] = useState('')
  const [fechaDesde, setFechaDesde] = useState('')
  const [fechaHasta, setFechaHasta] = useState('')

  const { clientes } = useClientesOpciones()
  const saldo = useSaldoCliente(clienteFiltro)

  const params = useMemo<LibroMayorParams>(() => {
    const p: LibroMayorParams = { ...pagination.params }
    if (clienteFiltro != null) p.cliente = clienteFiltro
    if (tipoFiltro) p.tipo_asiento = tipoFiltro
    if (fechaDesde) p.fecha_creado_after = fechaDesde
    if (fechaHasta) p.fecha_creado_before = fechaHasta
    return p
  }, [pagination.params, clienteFiltro, tipoFiltro, fechaDesde, fechaHasta])

  const { asientos, count, isLoading, isError, error, refetch } = useLibroMayor(params)

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-container/40 text-primary">
            <Icon name="account_balance_wallet" size={20} />
          </div>
          <div>
            <p className="text-sm text-on-surface-variant">
              {clienteFiltro != null ? 'Saldo actual del cliente' : 'Saldo global'}
            </p>
            <p className="text-xl font-bold text-on-surface">
              {saldo.puedeVer ? formatMoney(saldo.saldo) : '—'}
            </p>
          </div>
        </div>
        {!saldo.puedeVer && (
          <p className="text-sm text-on-surface-variant sm:max-w-xs">
            Sala de lectura. El libro mayor recoge los movimientos de pedidos y pagos; solo lectura.
          </p>
        )}
      </div>

      <LibroMayorTable
        asientos={asientos}
        count={count}
        page={pagination.page}
        pageSize={pagination.pageSize}
        onPageChange={pagination.setPage}
        onPageSizeChange={pagination.setPageSize}
        isLoading={isLoading}
        isError={isError}
        errorMessage={error?.defaultMessage}
        onRetry={() => refetch()}
        search={pagination.search}
        onSearchChange={(value) => {
          pagination.setSearch(value)
          pagination.resetPage()
        }}
        clientes={clientes}
        clienteFiltro={clienteFiltro}
        onClienteChange={(value) => {
          setClienteFiltro(value)
          pagination.resetPage()
        }}
        tipoFiltro={tipoFiltro}
        onTipoChange={(value) => {
          setTipoFiltro(value)
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
      />
    </div>
  )
}