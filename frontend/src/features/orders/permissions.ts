import type { EstadoPedido, RolUsuario } from '@/types/models'

const ROLES_ESCRITURA = new Set<RolUsuario>(['administrador', 'empleado'])

export function puedeGestionarPedidos(rol?: RolUsuario | null): boolean {
  return !!rol && ROLES_ESCRITURA.has(rol)
}

export function puedeConfirmarPedido(rol?: RolUsuario | null): boolean {
  return puedeGestionarPedidos(rol)
}

type Transicion = Partial<Record<EstadoPedido, RolUsuario[]>>

const TRANSICIONES: Record<EstadoPedido, Transicion> = {
  borrador: {
    cancelado: ['administrador', 'empleado'],
  },
  confirmado: {
    en_laboratorio: ['administrador', 'empleado'],
    entregado: ['administrador', 'empleado'], // mostrador: saltar al final
    cancelado: ['administrador', 'empleado'],
  },
  en_laboratorio: {
    listo_para_entrega: ['administrador', 'empleado'],
    cancelado: ['administrador', 'empleado'],
  },
  listo_para_entrega: {
    entregado: ['administrador', 'empleado'],
    cancelado: ['administrador', 'empleado'],
  },
  entregado: {},
  cancelado: {},
}

const FLUJO: EstadoPedido[] = [
  'borrador',
  'confirmado',
  'en_laboratorio',
  'listo_para_entrega',
  'entregado',
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
