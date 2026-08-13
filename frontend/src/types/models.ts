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

export type TipoProducto =
  | 'montura'
  | 'cristal_terminado'
  | 'bloque_tallado'
  | 'accesorio'

export interface Categoria {
  id: number
  nombre: string
  tipo_producto: TipoProducto
  tipo_producto_display: string
  activo: boolean
}

export interface CategoriaResumen {
  id: number
  nombre: string
  tipo_producto: TipoProducto
  tipo_producto_display: string
}

export interface VarianteProducto {
  id: number
  producto: number
  sku: string
  codigo_barras: string | null
  color: string
  tamano: string
  esfera: string | null
  cilindro: string | null
  eje: number | null
  adicion: string | null
  stock: number
  alerta_stock_minimo: number
  precio_al_mayor: string
  precio_costo: string
  activo: boolean
}

export interface Producto {
  id: number
  categoria: number
  categoria_detalle: CategoriaResumen
  marca: string
  codigo_modelo: string
  descripcion: string
  indice_refraccion: string
  material: string
  tratamiento: string
  diseno: string
  activo: boolean
  creado_en: string
  actualizado_en: string
  variantes: VarianteProducto[]
}

export interface RecetaOptica {
  id: number
  nombre_paciente: string
  od_esfera: string | null
  od_cilindro: string | null
  od_eje: number | null
  od_adicion: string | null
  oi_esfera: string | null
  oi_cilindro: string | null
  oi_eje: number | null
  oi_adicion: string | null
  distancia_pupilar: string | null
  notas: string
  activo: boolean
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
