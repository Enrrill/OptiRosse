export const API_BASE = '/api/v1'

export const AUTH_ENDPOINTS = {
  login: '/auth/login/',
  refresh: '/auth/refresh/',
  logout: '/auth/logout/',
  me: '/auth/me/',
  cambiarContrasena: '/auth/cambiar-contrasena/',
}

export const USUARIOS = '/usuarios/'
export const CLIENTES = '/clientes/'
export const CATEGORIAS = '/categorias/'
export const PRODUCTOS = '/productos/'
export const VARIANTES = '/variantes/'
export const RECETAS = '/recetas/'
export const PEDIDOS = '/pedidos/'
export const METODOS_PAGO = '/metodos-pago/'
export const PAGOS = '/pagos/'
export const LIBRO_MAYOR = '/libro-mayor/'
export const PLANTILLAS = '/plantillas/'

export const detalle = (base: string, id: number | string) => `${base}${id}/`
export const accion = (base: string, id: number | string, nombre: string) => `${base}${id}/${nombre}/`
