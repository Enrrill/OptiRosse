export type RolUsuario =
  | 'administrador'
  | 'vendedor_b2b'
  | 'almacen'
  | 'tecnico_taller'
  | 'contabilidad'

export interface Usuario {
  id: number
  nombre_usuario: string
  correo: string
  nombre: string
  apellido: string
  rol: RolUsuario
  telefono: string | null
  activo: boolean
  creado_en: string
  actualizado_en: string
}

export interface TokenResponse {
  access: string
  refresh: string
}

export type EstadoPedido =
  | 'borrador'
  | 'confirmado'
  | 'en_taller'
  | 'listo_para_despacho'
  | 'enviado'
  | 'cancelado'

export type EstadoPago = 'pendiente' | 'aprobado' | 'rechazado'

export interface Cliente {
  id: number
  razon_social: string
  nombre_comercial: string
  identificacion_fiscal: string
  correo: string
  telefono: string
  direccion: string
  limite_credito: string
  dias_credito: number
  activo: boolean
  creado_en: string
  actualizado_en: string
}

export interface ClienteResumen {
  id: number
  razon_social: string
  nombre_comercial: string
  identificacion_fiscal: string
}

export interface LibroMayorAsiento {
  id: number
  cliente: number
  cliente_detalle: ClienteResumen
  pedido_numero: string | null
  pago_detalle: unknown | null
  tipo_asiento: 'debito' | 'credito' | string
  tipo_asiento_display: string
  monto: number | string
  saldo_posterior: number | string
  descripcion: string
  asiento_origen_id: number | null
  creado_en: string
}

export interface Periodo {
  desde: string
  hasta: string
}

export interface PagosPendientesKpi {
  cantidad: number
  monto: number
}

export interface DashboardKpis {
  pedidos_por_estado?: Partial<Record<EstadoPedido, number>> | null
  total_vendido_mes?: number | null
  clientes?: number | null
  stock_bajo?: number | null
  pagos_pendientes?: PagosPendientesKpi | null
  saldo_por_cobrar?: number | null
}

export interface PedidoResumen {
  id: number
  numero_pedido: string
  cliente_nombre: string
  estado: EstadoPedido | string
  total: number
  creado_en: string
}

export interface PagoResumen {
  id: number
  cliente_nombre: string
  metodo_pago_nombre: string
  monto: number
  estado: EstadoPago | string
  creado_en: string
}

export interface DashboardRecientes {
  pedidos: PedidoResumen[]
  pagos?: PagoResumen[] | null
}

export interface DashboardResumen {
  fecha: string
  periodo: Periodo
  kpis: DashboardKpis
  recientes: DashboardRecientes
}
