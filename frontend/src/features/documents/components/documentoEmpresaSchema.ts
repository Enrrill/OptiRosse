import { z } from 'zod'

export const documentoEmpresaSchema = z.object({
  nombre: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(150, 'Máximo 150 caracteres'),
  descripcion: z.string().optional(),
  categoria: z.enum(['institucional', 'recursos_humanos', 'financiero', 'operativo', 'otro'], {
    required_error: 'Selecciona una categoría',
  }),
  version: z.string().min(1, 'La versión es requerida'),
  es_plantilla_generable: z.boolean().default(false),
})

export type DocumentoEmpresaFormValues = z.infer<typeof documentoEmpresaSchema>
