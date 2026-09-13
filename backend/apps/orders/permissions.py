from backend.apps.core.choices import RolUsuario
from backend.common.api.permissions import es_rol, es_rol_o_lectura

ROLES_ACTIVOS = (RolUsuario.ADMINISTRADOR, RolUsuario.VENDEDORA)

EscrituraRecetaOLectura = es_rol_o_lectura(*ROLES_ACTIVOS)
EscrituraPedidoOLectura = es_rol_o_lectura(*ROLES_ACTIVOS)
PuedeConfirmarPedido = es_rol(*ROLES_ACTIVOS)
PuedeTransicionarPedido = es_rol(*ROLES_ACTIVOS)
