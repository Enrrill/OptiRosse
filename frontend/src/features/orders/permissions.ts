import type { EstadoPedido, RolUsuario } from '@/types/models'

const ROLES_ESCRITURA = new Set<RolUsuario>(['administrador', 'vendedor_b2b'])

export function puedeGestionarPedidos(rol?: RolUsuario | null): boolean {
  return !!rol && ROLES_ESCRITURA.has(rol)
}

export function puedeConfirmarPedido(rol?: RolUsuario | null): boolean {
  return puedeGestionarPedidos(rol)
}

type Transicion = Partial<Record<EstadoPedido, RolUsuario[]>>

const TRANSICIONES: Record<EstadoPedido, Transicion> = {
  borrador: {
    // La confirmación no es una transición de cambiar-estado: el botón
    // "Confirmar pedido" (puedeConfirmarPedido) va por el endpoint dedicado.
    cancelado: ['administrador', 'vendedor_b2b'],
  },
  confirmado: {
    en_taller: ['administrador', 'tecnico_taller'],
    cancelado: ['administrador', 'vendedor_b2b'],
  },
  en_taller: {
    listo_para_despacho: ['administrador', 'tecnico_taller'],
    cancelado: ['administrador', 'vendedor_b2b', 'tecnico_taller'],
  },
  listo_para_despacho: {
    enviado: ['administrador', 'almacen'],
    cancelado: ['administrador', 'vendedor_b2b', 'tecnico_taller'],
  },
  enviado: {},
  cancelado: {},
}

const FLUJO: EstadoPedido[] = [
  'borrador',
  'confirmado',
  'en_taller',
  'listo_para_despacho',
  'enviado',
]

export function puedeTransicionar(
  estado: EstadoPedido,
  destino: EstadoPedido,
  rol?: RolUsuario | null,
): boolean {
  if (!rol) return false
  return (TRANSICIONES[estado][destino] ?? []).includes(rol)
}

/**
 * Siguiente transición del flujo principal permitida para el rol.
 * Excluye `cancelado` (botón aparte) y `confirmado` (transición que solo
 * se realiza por el endpoint dedicado de confirmar, que descuenta stock
 * y registra el asiento contable).
 */
export function siguienteTransicion(
  estado: EstadoPedido,
  rol?: RolUsuario | null,
): EstadoPedido | null {
  if (!rol) return null
  for (const destino of FLUJO) {
    if (
      destino !== 'cancelado' &&
      destino !== 'confirmado' &&
      puedeTransicionar(estado, destino, rol)
    ) {
      return destino
    }
  }
  return null
}

export function puedeCancelar(
  estado: EstadoPedido,
  rol?: RolUsuario | null,
): boolean {
  return puedeTransicionar(estado, 'cancelado', rol)
}
