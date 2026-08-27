import { FormProvider, useForm, useFormContext } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Icon } from '@/components/Icon'
import { FieldError } from '@/components/forms/FieldError'
import { MoneyInput } from '@/components/forms/MoneyInput'
import { SectionCard } from '@/components/forms/SectionCard'
import { SearchableSelect } from '@/components/forms/SearchableSelect'
import { ApiError } from '@/lib/api/errors'
import { useToast } from '@/store/useToast'
import { formatMoney } from '@/lib/format'
import { preventScientificNotationKeys, preventScientificNotationPaste } from '@/lib/utils'
import { buscarClientes } from '@/lib/api/opciones'
import { buscarMetodosPago, buscarPedidos } from '../hooks/useOpcionesPago'
import { useCrearPago } from '../hooks/usePagoMutations'
import {
  pagoSchema,
  PAGO_DEFAULT_VALUES,
  toPagoPayload,
  type ClienteSeleccion,
  type PagoFormValues,
} from './pagoSchema'
import type { Cliente } from '@/types/models'

interface RegistrarPagoFormProps {
  preselectCliente?: Cliente | null
  onSuccess: () => void
  onCancel: () => void
}

export function RegistrarPagoForm({ preselectCliente, onSuccess, onCancel }: RegistrarPagoFormProps) {
  const form = useForm<PagoFormValues>({
    resolver: zodResolver(pagoSchema),
    defaultValues: preselectCliente
      ? {
          ...PAGO_DEFAULT_VALUES,
          cliente: {
            id: preselectCliente.id,
            nombre_comercial: preselectCliente.nombre_comercial,
            razon_social: preselectCliente.razon_social,
          },
          fecha_pago: datetimeLocalNow(),
        }
      : { ...PAGO_DEFAULT_VALUES, fecha_pago: datetimeLocalNow() },
    mode: 'onTouched',
  })

  return (
    <FormProvider {...form}>
      <FormCuerpo onSuccess={onSuccess} onCancel={onCancel} />
    </FormProvider>
  )
}

function datetimeLocalNow(): string {
  const now = new Date()
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
  return now.toISOString().slice(0, 16)
}

function FormCuerpo({ onSuccess, onCancel }: Omit<RegistrarPagoFormProps, 'preselectCliente'>) {
  const { register, handleSubmit, watch, setValue, getValues, setError, formState } =
    useFormContext<PagoFormValues>()
  const errors = formState.errors

  const cliente = watch('cliente')
  const pedido = watch('pedido')
  const metodo = watch('metodo_pago')

  const crear = useCrearPago()
  const toast = useToast()

  const mapFields: Record<string, keyof PagoFormValues> = {
    cliente: 'cliente',
    pedido: 'pedido',
    metodo_pago: 'metodo_pago',
    monto: 'monto',
    tasa_cambio: 'tasa_cambio',
    numero_referencia: 'numero_referencia',
    fecha_pago: 'fecha_pago',
    comprobante_imagen_url: 'comprobante_imagen_url',
  }

  const mapearErrores = (apiError: ApiError) => {
    const errores = apiError.errors
    if (!errores || Array.isArray(errores)) {
      toast.error(apiError.defaultMessage)
      return
    }
    let mapped = false
    for (const [campo, mensajes] of Object.entries(errores)) {
      const destino = mapFields[campo]
      if (destino && mensajes?.length) {
        setError(destino, { type: 'server', message: mensajes[0] })
        mapped = true
      }
    }
    if (!mapped) toast.error(apiError.defaultMessage)
  }

  const onSubmit = handleSubmit(async (values) => {
    try {
      await crear.mutateAsync(toPagoPayload(values))
      onSuccess()
    } catch (err) {
      if (err instanceof ApiError) mapearErrores(err)
      else toast.error('No se pudo registrar el pago')
    }
  })

  const seleccionarClienteDesdePedido = (clienteSeleccionado: ClienteSeleccion) => {
    setValue(
      'cliente',
      {
        id: clienteSeleccionado.id,
        nombre_comercial: clienteSeleccionado.nombre_comercial,
        razon_social: clienteSeleccionado.razon_social,
      },
      { shouldDirty: true, shouldValidate: true },
    )
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col flex-1 min-h-0 overflow-hidden">
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <SectionCard icon="person" title="Cliente y pedido">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pago-cliente">Cliente *</Label>
              <SearchableSelect<ClienteSeleccion>
                keyId="pago-cliente"
                value={cliente}
                onChange={(value) => {
                  setValue('cliente', value, { shouldDirty: true, shouldValidate: true })
                  // Si cambia el cliente y el pedido actual no pertenece al nuevo cliente, limpiamos el pedido
                  if (pedido && (!value || pedido.cliente_detalle.id !== value.id)) {
                    setValue('pedido', null, { shouldDirty: true, shouldValidate: true })
                  }
                }}
                searchOptions={buscarClientes}
                formatSelected={(c) => c.nombre_comercial}
                placeholder="Buscar cliente por nombre o RIF..."
              />
              <FieldError message={errors.cliente?.message} />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Pedido (opcional)</Label>
                {cliente ? (
                  <span className="text-xs text-primary font-medium">
                    Filtrado por: {cliente.nombre_comercial}
                  </span>
                ) : (
                  <span className="text-xs text-on-surface-variant/80">
                    Selecciona un cliente para filtrar
                  </span>
                )}
              </div>
              <SearchableSelect<NonNullable<PagoFormValues['pedido']>>
                keyId={`pago-pedido-cliente-${cliente?.id ?? 'all'}`}
                value={pedido}
                onChange={(value) => {
                  setValue('pedido', value, { shouldDirty: true, shouldValidate: true })
                  // Si se selecciona un pedido y no hay cliente o es distinto, autocompletar cliente
                  if (value?.cliente_detalle) {
                    seleccionarClienteDesdePedido(value.cliente_detalle)
                  }
                  // Si hay total en el pedido y el monto actual está vacío o en 0, autocompletar el monto
                  if (value?.total) {
                    const montoActual = getValues('monto')
                    if (montoActual === undefined || isNaN(montoActual) || montoActual === 0) {
                      const totalNum = parseFloat(value.total)
                      if (!isNaN(totalNum) && totalNum > 0) {
                        setValue('monto', totalNum, { shouldDirty: true, shouldValidate: true })
                      }
                    }
                  }
                }}
                searchOptions={(q) => buscarPedidos(q, cliente?.id)}
                formatSelected={(p) => p.numero_pedido}
                placeholder={
                  cliente
                    ? `Buscar pedidos de ${cliente.nombre_comercial}...`
                    : 'Buscar pedido por N.º o cliente...'
                }
              />
              {pedido && (
                <p className="text-xs text-on-surface-variant font-medium">
                  Pedido {pedido.numero_pedido} · Total {formatMoney(pedido.total)}
                </p>
              )}
              <FieldError message={errors.pedido?.message} />
            </div>
          </div>
        </SectionCard>

        <SectionCard icon="payments" title="Datos del pago">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="pago-metodo">Método de pago *</Label>
              <SearchableSelect<NonNullable<PagoFormValues['metodo_pago']>>
                keyId="pago-metodo"
                value={metodo}
                onChange={(value) =>
                  setValue('metodo_pago', value, { shouldDirty: true, shouldValidate: true })
                }
                searchOptions={buscarMetodosPago}
                formatSelected={(m) => m.nombre}
                placeholder="Buscar método de pago..."
              />
              {metodo?.requiere_referencia && (
                <p className="text-xs text-secondary">
                  Este método requiere número de referencia.
                </p>
              )}
              <FieldError message={errors.metodo_pago?.message} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pago-monto">Monto *</Label>
              <MoneyInput
                id="pago-monto"
                placeholder="0.00"
                {...register('monto', { valueAsNumber: true })}
                aria-invalid={!!errors.monto}
              />
              <FieldError message={errors.monto?.message} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pago-tasa">Tasa de cambio</Label>
              <Input
                id="pago-tasa"
                type="number"
                inputMode="decimal"
                step="any"
                min="0"
                defaultValue={1}
                onKeyDown={preventScientificNotationKeys}
                onPaste={preventScientificNotationPaste}
                {...register('tasa_cambio', { valueAsNumber: true })}
                aria-invalid={!!errors.tasa_cambio}
              />
              <FieldError message={errors.tasa_cambio?.message} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pago-referencia">Número de referencia</Label>
              <Input
                id="pago-referencia"
                placeholder="000-0000-0000"
                {...register('numero_referencia')}
                aria-invalid={!!errors.numero_referencia}
              />
              <FieldError message={errors.numero_referencia?.message} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pago-fecha">Fecha del pago</Label>
              <Input id="pago-fecha" type="datetime-local" {...register('fecha_pago')} />
              <FieldError message={errors.fecha_pago?.message} />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="pago-comprobante">URL del comprobante (opcional)</Label>
              <Input
                id="pago-comprobante"
                type="url"
                placeholder="https://..."
                {...register('comprobante_imagen_url')}
              />
              <FieldError message={errors.comprobante_imagen_url?.message} />
            </div>
          </div>
        </SectionCard>
      </div>

      <div className="flex-none border-t border-outline-variant/60 bg-surface-container-lowest px-6 py-4 flex items-center justify-end gap-3 z-10">
        <Button type="button" variant="outline" onClick={onCancel} disabled={crear.isPending}>
          Cancelar
        </Button>
        <Button type="submit" disabled={crear.isPending}>
          {crear.isPending && <Icon name="progress_activity" className="mr-2 animate-spin" />}
          Registrar pago
        </Button>
      </div>
    </form>
  )
}