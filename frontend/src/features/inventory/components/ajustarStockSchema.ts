import { z } from 'zod'

export const ajustarStockSchema = z
  .object({
    cantidad: z.number('Ingresa un número válido').int('Debe ser un número entero'),
    motivo: z.string().trim(),
  })
  .superRefine((data, ctx) => {
    if (data.cantidad < 0 && !data.motivo) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['motivo'],
        message: 'El motivo es obligatorio cuando reduces stock',
      })
    }
  })

export type AjustarStockFormValues = z.infer<typeof ajustarStockSchema>
export type AjustarStockPayload = AjustarStockFormValues

export const AJUSTAR_STOCK_DEFAULT_VALUES: AjustarStockFormValues = {
  cantidad: 0,
  motivo: '',
}