export interface ChoiceDisplay {
  label: string
  badge: string
}

export const ROLES: Record<string, ChoiceDisplay> = {
  administrador: {
    label: 'Administrador',
    badge: 'bg-primary-container/20 text-primary',
  },
  vendedor_b2b: {
    label: 'Vendedor B2B',
    badge: 'bg-secondary-container/25 text-secondary',
  },
  almacen: {
    label: 'Almacén',
    badge: 'bg-surface-variant/40 text-on-surface-variant',
  },
  tecnico_taller: {
    label: 'Técnico de Taller',
    badge: 'bg-tertiary-container/20 text-tertiary',
  },
  contabilidad: {
    label: 'Contabilidad',
    badge: 'bg-green-500/15 text-green-700 dark:text-green-300',
  },
}

export const ESTADO_PEDIDO: Record<string, ChoiceDisplay> = {
  borrador: {
    label: 'Borrador',
    badge: 'bg-surface-variant/40 text-on-surface-variant',
  },
  confirmado: {
    label: 'Confirmado',
    badge: 'bg-primary-container/20 text-primary',
  },
  en_taller: {
    label: 'En Taller',
    badge: 'bg-secondary-container/25 text-secondary',
  },
  listo_para_despacho: {
    label: 'Listo para Despacho',
    badge: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
  },
  enviado: {
    label: 'Enviado',
    badge: 'bg-green-500/15 text-green-700 dark:text-green-300',
  },
  cancelado: {
    label: 'Cancelado',
    badge: 'bg-error-container/50 text-error',
  },
}

export const ESTADO_PAGO: Record<string, ChoiceDisplay> = {
  pendiente: {
    label: 'Pendiente',
    badge: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
  },
  aprobado: {
    label: 'Aprobado',
    badge: 'bg-green-500/15 text-green-700 dark:text-green-300',
  },
  rechazado: {
    label: 'Rechazado',
    badge: 'bg-error-container/50 text-error',
  },
}

export const TIPO_PRODUCTO: Record<string, ChoiceDisplay> = {
  montura: { label: 'Montura', badge: 'bg-primary-container/20 text-primary' },
  cristal_terminado: { label: 'Cristal Terminado', badge: 'bg-secondary-container/25 text-secondary' },
  bloque_tallado: { label: 'Bloque Tallado', badge: 'bg-amber-500/15 text-amber-700 dark:text-amber-300' },
  accesorio: { label: 'Accesorio', badge: 'bg-surface-variant/40 text-on-surface-variant' },
}

export const TIPO_ASIENTO: Record<string, ChoiceDisplay> = {
  debito: { label: 'Débito', badge: 'bg-error-container/50 text-error' },
  credito: { label: 'Crédito', badge: 'bg-green-500/15 text-green-700 dark:text-green-300' },
}

export const TIPO_DOCUMENTO: Record<string, ChoiceDisplay> = {
  factura: { label: 'Factura', badge: 'bg-primary-container/20 text-primary' },
  orden_trabajo: { label: 'Orden de Trabajo', badge: 'bg-secondary-container/25 text-secondary' },
  nota_entrega: { label: 'Nota de Entrega', badge: 'bg-surface-variant/40 text-on-surface-variant' },
  recibo_pago: { label: 'Recibo de Pago', badge: 'bg-green-500/15 text-green-700 dark:text-green-300' },
}

export const ESTADO_ACTIVO: Record<string, ChoiceDisplay> = {
  true: {
    label: 'Activo',
    badge: 'bg-green-500/15 text-green-700 dark:text-green-300',
  },
  false: {
    label: 'Inactivo',
    badge: 'bg-error-container/50 text-error',
  },
}

export function estadoActivo(activo?: boolean | null): ChoiceDisplay | null {
  if (activo === null || activo === undefined) return null
  return ESTADO_ACTIVO[String(activo)]
}

export function choice(map: Record<string, ChoiceDisplay>, value?: string | null): ChoiceDisplay | null {
  if (!value) return null
  return map[value] ?? { label: value, badge: 'bg-surface-variant/40 text-on-surface-variant' }
}
