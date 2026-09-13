from backend.apps.core.choices import RolUsuario
from backend.common.api.permissions import es_rol, es_rol_o_lectura

EscrituraMetodoPagoOLectura = es_rol_o_lectura(RolUsuario.ADMINISTRADOR)
GestionPago = es_rol(RolUsuario.ADMINISTRADOR, RolUsuario.VENDEDORA)
LecturaLibroMayor = es_rol(RolUsuario.ADMINISTRADOR, RolUsuario.VENDEDORA)
