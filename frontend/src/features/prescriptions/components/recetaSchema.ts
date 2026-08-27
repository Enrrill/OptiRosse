import { z } from 'zod'
import type { RecetaOptica } from '@/types/models'

const opticoNullable = z
  .number('Ingresa un valor válido')
  .finite('Ingresa un valor válido')
  .nullable()

const ejeNullable = z
  .number('Ingresa un valor válido')
  .int('Debe ser un número entero')
  .nullable()

const esferaOCilindro = opticoNullable.refine((v) => v === null || (v >= -30 && v <= 30), {
  message: 'Debe estar entre -30 y 30',
})

const adicion = opticoNullable.refine((v) => v === null || v >= 0, {
  message: 'No puede ser un valor negativo',
})

const eje = ejeNullable.refine((v) => v === null || (v >= 0 && v <= 180), {
  message: 'Debe estar entre 0 y 180',
})

const distanciaPupilar = opticoNullable.refine((v) => v === null || (v >= 40 && v <= 80), {
  message: 'Debe estar entre 40 y 80 mm',
})

export const recetaSchema = z
  .object({
    nombre_paciente: z
      .string()
      .trim()
      .min(2, 'El nombre del paciente es obligatorio (mínimo 2 caracteres)')
      .max(100, 'Máximo 100 caracteres'),
    od_esfera: esferaOCilindro,
    od_cilindro: esferaOCilindro,
    od_eje: eje,
    od_adicion: adicion,
    oi_esfera: esferaOCilindro,
    oi_cilindro: esferaOCilindro,
    oi_eje: eje,
    oi_adicion: adicion,
    distancia_pupilar: distanciaPupilar,
    notas: z.string().trim(),
  })
  .superRefine((data, ctx) => {
    // 1. Validar dependencia Cilindro vs Eje en OD
    if (data.od_cilindro !== null && data.od_cilindro !== 0 && data.od_eje === null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'El eje es obligatorio si se indica cilindro',
        path: ['od_eje'],
      })
    }
    if (data.od_eje !== null && (data.od_cilindro === null || data.od_cilindro === 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Debe indicar un cilindro válido para el eje especificado',
        path: ['od_cilindro'],
      })
    }

    // 2. Validar dependencia Cilindro vs Eje en OI
    if (data.oi_cilindro !== null && data.oi_cilindro !== 0 && data.oi_eje === null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'El eje es obligatorio si se indica cilindro',
        path: ['oi_eje'],
      })
    }
    if (data.oi_eje !== null && (data.oi_cilindro === null || data.oi_cilindro === 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Debe indicar un cilindro válido para el eje especificado',
        path: ['oi_cilindro'],
      })
    }

    // 3. Al menos una medida óptica o distancia pupilar ingresada
    const tieneMedida = [
      data.od_esfera,
      data.od_cilindro,
      data.od_adicion,
      data.oi_esfera,
      data.oi_cilindro,
      data.oi_adicion,
      data.distancia_pupilar,
    ].some((v) => v !== null)

    if (!tieneMedida) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Debe ingresar la graduación de al menos un ojo (Esfera/Cilindro) o la distancia pupilar',
        path: ['od_esfera'],
      })
    }
  })


export type RecetaFormValues = z.infer<typeof recetaSchema>

/** Payload enviado al backend: los campos de graduación van como número o null. */
export type RecetaPayload = RecetaFormValues

export const RECETA_DEFAULT_VALUES: RecetaFormValues = {
  nombre_paciente: '',
  od_esfera: null,
  od_cilindro: null,
  od_eje: null,
  od_adicion: null,
  oi_esfera: null,
  oi_cilindro: null,
  oi_eje: null,
  oi_adicion: null,
  distancia_pupilar: null,
  notas: '',
}

function numeroOpcional(valor?: string | null): number | null {
  if (valor === null || valor === undefined || valor === '') return null
  return Number(valor)
}

export function toRecetaFormValues(receta: RecetaOptica): RecetaFormValues {
  return {
    nombre_paciente: receta.nombre_paciente,
    od_esfera: numeroOpcional(receta.od_esfera),
    od_cilindro: numeroOpcional(receta.od_cilindro),
    od_eje: numeroOpcional(receta.od_eje !== null ? String(receta.od_eje) : null),
    od_adicion: numeroOpcional(receta.od_adicion),
    oi_esfera: numeroOpcional(receta.oi_esfera),
    oi_cilindro: numeroOpcional(receta.oi_cilindro),
    oi_eje: numeroOpcional(receta.oi_eje !== null ? String(receta.oi_eje) : null),
    oi_adicion: numeroOpcional(receta.oi_adicion),
    distancia_pupilar: numeroOpcional(receta.distancia_pupilar),
    notas: receta.notas,
  }
}

export function toRecetaPayload(values: RecetaFormValues): RecetaPayload {
  return {
    nombre_paciente: values.nombre_paciente,
    od_esfera: values.od_esfera,
    od_cilindro: values.od_cilindro,
    od_eje: values.od_eje,
    od_adicion: values.od_adicion,
    oi_esfera: values.oi_esfera,
    oi_cilindro: values.oi_cilindro,
    oi_eje: values.oi_eje,
    oi_adicion: values.oi_adicion,
    distancia_pupilar: values.distancia_pupilar,
    notas: values.notas,
  }
}
