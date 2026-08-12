import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ApiError } from '@/lib/api/errors'
import { useToast } from '@/store/useToast'
import { Icon } from '@/components/Icon'
import { FieldError } from '@/components/forms/FieldError'
import { StockBadge } from '@/components/data/StockBadge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useAjustarStock } from '../hooks/useVarianteMutations'
import {
  ajustarStockSchema,
  AJUSTAR_STOCK_DEFAULT_VALUES,
  type AjustarStockFormValues,
} from './ajustarStockSchema'
import type { VarianteProducto } from '@/types/models'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

interface AjustarStockDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  variante: VarianteProducto | null
}

export function AjustarStockDialog({ open, onOpenChange, variante }: AjustarStockDialogProps) {
  const toast = useToast()
  const [submitting, setSubmitting] = useState(false)
  const ajustar = useAjustarStock(variante?.id ?? null)

  const {
    register,
    handleSubmit,
    control,
    setError,
    reset,
    formState: { errors },
  } = useForm<AjustarStockFormValues>({
    resolver: zodResolver(ajustarStockSchema),
    defaultValues: AJUSTAR_STOCK_DEFAULT_VALUES,
  })

  const cantidad = useWatch({ control, name: 'cantidad' })
  const stockActual = variante?.stock ?? 0
  const stockResultante =
    variante != null && Number.isFinite(cantidad) ? stockActual + cantidad : null
  const bloqueado = stockResultante != null && stockResultante < 0

  const onSubmit = handleSubmit(async (values) => {
    if (variante == null) return
    setSubmitting(true)
    try {
      await ajustar.mutateAsync(values)
      onOpenChange(false)
    } catch (err) {
      const apiErr = err as ApiError
      if (apiErr.errors && !Array.isArray(apiErr.errors)) {
        let mapped = false
        for (const [field, msgs] of Object.entries(apiErr.errors)) {
          if (msgs?.length) {
            setError(field as keyof AjustarStockFormValues, { message: msgs[0] })
            mapped = true
          }
        }
        if (!mapped) toast.error(apiErr.defaultMessage)
      } else {
        toast.error(apiErr.defaultMessage)
      }
    } finally {
      setSubmitting(false)
    }
  })

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) reset()
        onOpenChange(o)
      }}
    >
      <DialogContent className="w-full max-w-md">
        <DialogHeader>
          <DialogTitle>Ajustar stock</DialogTitle>
          <DialogDescription>
            {variante ? (
              <>
                <span className="font-mono text-xs text-primary">{variante.sku}</span>{' '}
                <span className="text-on-surface-variant">·</span> stock actual{' '}
                <StockBadge stock={stockActual} />
              </>
            ) : (
              'Selecciona una variante para ajustar su stock.'
            )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="cantidad">Cantidad</Label>
            <Input
              id="cantidad"
              type="number"
              step={1}
              placeholder="0"
              aria-label="Cantidad a sumar o restar"
              {...register('cantidad', { valueAsNumber: true })}
            />
            <FieldError message={errors.cantidad?.message} />
            <p className="text-xs text-on-surface-variant">
              Usa un número negativo para reducir stock.
            </p>
          </div>

          <div className="rounded-lg border border-outline-variant bg-surface-container-low px-4 py-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-on-surface-variant">Stock resultante</span>
              <span
                className={cn(
                  'font-mono text-lg font-bold',
                  stockResultante == null
                    ? 'text-on-surface-variant'
                    : stockResultante < 0
                      ? 'text-error'
                      : 'text-on-surface',
                )}
              >
                {stockResultante == null ? '—' : stockResultante}
              </span>
            </div>
            {stockResultante != null && stockResultante < 0 && (
              <p className="mt-1 flex items-center gap-1 text-xs font-medium text-error">
                <Icon name="error" size={14} />
                El stock no puede quedar en negativo.
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="motivo">Motivo</Label>
            <Textarea
              id="motivo"
              rows={2}
              placeholder={cantidad < 0 ? 'Ej: devolución al proveedor' : 'Opcional'}
              {...register('motivo')}
            />
            <FieldError message={errors.motivo?.message} />
          </div>

          <DialogFooter className="pt-1">
            <Button type="button" variant="outline" disabled={submitting} onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" loading={submitting} disabled={bloqueado}>
              {!submitting && <Icon name="swap_vert" size={18} />}
              Ajustar stock
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}