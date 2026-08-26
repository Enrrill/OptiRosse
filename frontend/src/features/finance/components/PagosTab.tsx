import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import { CloseButton } from '@/components/ui/close-button'
import { useApiQuery } from '@/hooks/useApi'
import { usePagination } from '@/hooks/usePagination'
import { ConfirmDialog } from '@/components/forms/ConfirmDialog'
import { MotivoDialog } from '@/components/forms/MotivoDialog'
import { ApiError } from '@/lib/api/errors'
import { useToast } from '@/store/useToast'
import { CLIENTES, detalle } from '@/lib/api/endpoints'
import type { Cliente, Pago } from '@/types/models'
import { usePagos, type PagoParams } from '../hooks/usePagos'
import { useAprobarPago, useRechazarPago } from '../hooks/usePagoMutations'
import { useMetodosPago } from '../hooks/useMetodosPago'
import { useClientesOpciones } from '../hooks/useClientesOpciones'
import { PagosTable } from './PagosTable'
import { RegistrarPagoForm } from './RegistrarPagoForm'
import { PagoDetalleDialog } from './PagoDetalleDialog'

interface PagosTabProps {
  triggerNuevo?: number
}

export function PagosTab({ triggerNuevo }: PagosTabProps) {
  const [searchParams, setSearchParams] = useSearchParams()

  const pagination = usePagination()
  const [estadoFiltro, setEstadoFiltro] = useState('')
  const [clienteFiltro, setClienteFiltro] = useState<number | null>(null)
  const [metodoFiltro, setMetodoFiltro] = useState<number | null>(null)
  const [fechaDesde, setFechaDesde] = useState('')
  const [fechaHasta, setFechaHasta] = useState('')

  const [drawerOpen, setDrawerOpen] = useState(() => searchParams.get('nuevo') === '1')
  const [detalleTarget, setDetalleTarget] = useState<Pago | null>(null)
  const [aprobarTarget, setAprobarTarget] = useState<Pago | null>(null)
  const [rechazarTarget, setRechazarTarget] = useState<Pago | null>(null)

  const [lastTrigger, setLastTrigger] = useState(triggerNuevo)
  if (triggerNuevo !== undefined && triggerNuevo !== lastTrigger) {
    setLastTrigger(triggerNuevo)
    setDrawerOpen(true)
  }

  const clienteParam = searchParams.get('cliente')
  const clientePreselectId =
    clienteParam && /^\d+$/.test(clienteParam) ? Number(clienteParam) : null

  const preselectCliente = useApiQuery<Cliente>(
    ['cliente', 'pago', 'preselect', clientePreselectId],
    clientePreselectId != null ? detalle(CLIENTES, clientePreselectId) : null,
  )

  useEffect(() => {
    if (searchParams.get('nuevo') === '1') {
      const next = new URLSearchParams(searchParams)
      next.delete('nuevo')
      setSearchParams(next, { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const { clientes } = useClientesOpciones()
  const { metodos } = useMetodosPago()

  const params = useMemo<PagoParams>(() => {
    const p: PagoParams = { ...pagination.params }
    if (estadoFiltro) p.estado = estadoFiltro
    if (clienteFiltro != null) p.cliente = clienteFiltro
    if (metodoFiltro != null) p.metodo_pago = metodoFiltro
    if (fechaDesde) p.fecha_pago_after = fechaDesde
    if (fechaHasta) p.fecha_pago_before = fechaHasta
    return p
  }, [pagination.params, estadoFiltro, clienteFiltro, metodoFiltro, fechaDesde, fechaHasta])

  const { pagos, count, isLoading, isError, error, refetch } = usePagos(params)

  const aprobar = useAprobarPago(aprobarTarget?.id ?? null)
  const rechazar = useRechazarPago(rechazarTarget?.id ?? null)
  const toast = useToast()

  const abrirNuevo = () => {
    setDrawerOpen(true)
  }

  const cerrarDrawer = () => setDrawerOpen(false)

  const confirmarAprobacion = async () => {
    if (!aprobarTarget) return
    try {
      await aprobar.mutateAsync()
      setAprobarTarget(null)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.defaultMessage : 'No se pudo aprobar el pago')
    }
  }

  const confirmarRechazo = async (motivo: string) => {
    if (!rechazarTarget) return
    try {
      await rechazar.mutateAsync({ motivo })
      setRechazarTarget(null)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.defaultMessage : 'No se pudo rechazar el pago')
    }
  }

  return (
    <div className="space-y-4">
      <PagosTable
        pagos={pagos}
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
        estadoFiltro={estadoFiltro}
        onEstadoChange={(value) => {
          setEstadoFiltro(value)
          pagination.resetPage()
        }}
        clientes={clientes}
        clienteFiltro={clienteFiltro}
        onClienteChange={(value) => {
          setClienteFiltro(value)
          pagination.resetPage()
        }}
        metodos={metodos}
        metodoFiltro={metodoFiltro}
        onMetodoChange={(value) => {
          setMetodoFiltro(value)
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
        onVer={setDetalleTarget}
        onAprobar={setAprobarTarget}
        onRechazar={setRechazarTarget}
        onNuevo={abrirNuevo}
      />

      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent
          side="right"
          className="sm:w-[540px] md:w-[640px] flex flex-col h-full overflow-hidden"
        >
          <DrawerHeader className="p-6 pb-4 flex-none border-b border-outline-variant">
            <div>
              <DrawerTitle className="text-xl font-bold">Registrar pago</DrawerTitle>
              <DrawerDescription className="mt-1">
                Registrar un pago: queda pendiente hasta aprobarse.
              </DrawerDescription>
            </div>
            <DrawerClose asChild>
              <CloseButton size="md" />
            </DrawerClose>
          </DrawerHeader>

          {preselectCliente.isLoading ? null : (
            <RegistrarPagoForm
              key={clientePreselectId ?? 'nuevo'}
              preselectCliente={preselectCliente.data?.data ?? null}
              onSuccess={cerrarDrawer}
              onCancel={cerrarDrawer}
            />
          )}
        </DrawerContent>
      </Drawer>

      <PagoDetalleDialog
        open={detalleTarget != null}
        onOpenChange={(open) => {
          if (!open) setDetalleTarget(null)
        }}
        pago={detalleTarget}
      />

      <ConfirmDialog
        open={aprobarTarget != null}
        onOpenChange={(open) => {
          if (!open) setAprobarTarget(null)
        }}
        title="¿Aprobar este pago?"
        description="Al aprobar se registra un asiento de crédito en el libro mayor del cliente. Esta acción no se puede deshacer."
        confirmLabel="Aprobar pago"
        loading={aprobar.isPending}
        onConfirm={confirmarAprobacion}
      />

      <MotivoDialog
        open={rechazarTarget != null}
        onOpenChange={(open) => {
          if (!open) setRechazarTarget(null)
        }}
        title="¿Rechazar este pago?"
        description="Se necesita un motivo. El pago quedará en estado rechazado."
        confirmLabel="Rechazar pago"
        loading={rechazar.isPending}
        onSubmit={confirmarRechazo}
      />
    </div>
  )
}