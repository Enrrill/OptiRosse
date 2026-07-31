from backend.apps.core.choices import RolUsuario
from backend.common.api.permissions import es_rol, es_rol_o_lectura

EscrituraInventarioOLectura = es_rol_o_lectura(RolUsuario.ADMINISTRADOR, RolUsuario.ALMACEN)
EscrituraInventario = es_rol(RolUsuario.ADMINISTRADOR, RolUsuario.ALMACEN)
