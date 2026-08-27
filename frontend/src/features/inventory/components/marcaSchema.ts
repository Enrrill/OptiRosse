import { z } from 'zod'

export const marcaSchema = z.object({
  nombre: z.string().trim().min(1, 'El nombre de la marca es obligatorio').max(100, 'Máximo 100 caracteres'),
})

export type MarcaPayload = z.infer<typeof marcaSchema>
