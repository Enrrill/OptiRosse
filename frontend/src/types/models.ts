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
  limite_credito: string | null
  dias_credito: number | null
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

export interface Marca {
  id: number
  nombre: string
  activo: boolean
}

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

export interface VarianteResumen {
  id: number
  sku: string
  producto_marca: string
  producto_codigo_modelo: string
  color: string
  tamano: string
  esfera: string | null
  cilindro: string | null
  eje: number | null
  adicion: string | null
}

export interface DetallePedido {
  id: number
  variante: number
  variante_detalle: VarianteResumen
  cantidad: number
  precio_unitario: string
  precio_total: string
}

export interface Pedido {
  id: number
  numero_pedido: string
  cliente: number
  cliente_detalle: ClienteResumen
  usuario: number
  usuario_nombre: string
  receta: number | null
  receta_detalle: RecetaOptica | null
  estado: EstadoPedido
  subtotal: string
  impuesto: string
  total: string
  notas: string
  detalles: DetallePedido[]
  creado_en: string
  actualizado_en: string
}

export interface DetallePedidoPayload {
  id?: number
  variante: number
  cantidad: number
  precio_unitario: number | null
}

export interface PedidoPayload {
  cliente: number
  receta?: number | null
  notas?: string
  detalles: DetallePedidoPayload[]
}

export interface PagoDetalle {
  id: number
  monto: number | string
  estado: EstadoPago | string
  numero_referencia: string
}

export interface MetodoPago {
  id: number
  nombre: string
  moneda: string
  requiere_referencia: boolean
  activo: boolean
}

export interface MetodoPagoPayload {
  nombre: string
  moneda: string
  requiere_referencia: boolean
}

export interface Pago {
  id: number
  cliente: number
  cliente_detalle: ClienteResumen
  pedido: number | null
  pedido_numero: string | null
  metodo_pago: number
  metodo_pago_detalle: string
  monto: number | string
  tasa_cambio: number | string
  numero_referencia: string
  comprobante_imagen_url: string
  estado: EstadoPago | string
  estado_display: string
  fecha_pago: string
  motivo_rechazo: string
  creado_en: string
  actualizado_en: string
}

export interface PagoPayload {
  cliente: number
  pedido?: number | null
  metodo_pago: number
  monto: number | string
  tasa_cambio?: number | string
  numero_referencia?: string
  comprobante_imagen_url?: string
  fecha_pago?: string
}

export interface LibroMayorAsiento {
  id: number
  cliente: number
  cliente_detalle: ClienteResumen
  pedido: number | null
  pedido_numero: string | null
  pago: number | null
  pago_detalle: PagoDetalle | null
  tipo_asiento: 'debito' | 'credito' | string
  tipo_asiento_display: string
  monto: number | string
  saldo_posterior: number | string
  descripcion: string
  asiento_origen_id: number | null
  creado_en: string
  actualizado_en: string
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

export type TipoDocumento = 'factura' | 'orden_trabajo' | 'nota_entrega' | 'recibo_pago'

export interface PlantillaDocumento {
  id: number
  nombre: string
  tipo_documento: TipoDocumento
  tipo_documento_display: string
  contenido_html: string
  estilos_css: string
  activo: boolean
  actualizado_en: string
}

export interface PlantillaDocumentoPayload {
  nombre: string
  tipo_documento: TipoDocumento
  contenido_html: string
  estilos_css: string
}

export interface AuditoriaUsuarioResumen {
  id: number
  nombre_usuario: string
  nombre: string
  apellido: string
  rol: RolUsuario
}

export interface RegistroAuditoria {
  id: number
  usuario: number | null
  usuario_detalle: AuditoriaUsuarioResumen | null
  accion: string
  accion_display: string
  tabla_afectada: string
  tabla_display: string
  objeto_id: number | null
  detalles: Record<string, unknown> | null
  direccion_ip: string
  creado_en: string
  actualizado_en: string
}

export type CategoriaDocumentoEmpresa =
  | 'institucional'
  | 'recursos_humanos'
  | 'financiero'
  | 'operativo'
  | 'otro'

export interface VariableSchemaItem {
  clave: string
  etiqueta: string
  tipo?: 'texto' | 'fecha' | 'numero' | 'textarea'
  requerido?: boolean
  valor_defecto?: string
}

export interface DocumentoEmpresa {
  id: number
  nombre: string
  descripcion: string
  categoria: CategoriaDocumentoEmpresa
  categoria_display: string
  archivo: string | null
  archivo_url: string | null
  extension: string
  tamano_bytes: number
  version: string
  es_plantilla_generable: boolean
  variables_schema: VariableSchemaItem[]
  creado_por: number | null
  creado_por_nombre: string | null
  activo: boolean
  creado_en: string
  actualizado_en: string
}

export interface DocumentoEmpresaPayload {
  nombre: string
  descripcion?: string
  categoria: CategoriaDocumentoEmpresa
  archivo?: File | null
  version?: string
  es_plantilla_generable?: boolean
  variables_schema?: VariableSchemaItem[]
}

