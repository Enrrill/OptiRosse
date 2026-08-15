import { z } from 'zod'
import type { PlantillaDocumento } from '@/types/models'

export const plantillaSchema = z.object({
  nombre: z.string().trim().min(1, 'El nombre es obligatorio').max(100, 'Máximo 100 caracteres'),
  tipo_documento: z.enum(['factura', 'orden_trabajo', 'nota_entrega', 'recibo_pago']),
  contenido_html: z
    .string()
    .min(1, 'El contenido HTML no puede estar vacío'),
  estilos_css: z.string(),
})

export type PlantillaFormValues = z.infer<typeof plantillaSchema>

export const PLANTILLA_DEFAULT_VALUES: PlantillaFormValues = {
  nombre: '',
  tipo_documento: 'factura',
  contenido_html: '',
  estilos_css: '',
}

export function toPlantillaFormValues(plantilla: PlantillaDocumento): PlantillaFormValues {
  return {
    nombre: plantilla.nombre,
    tipo_documento: plantilla.tipo_documento,
    contenido_html: plantilla.contenido_html,
    estilos_css: plantilla.estilos_css,
  }
}