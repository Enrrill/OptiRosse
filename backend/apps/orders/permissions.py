from backend.apps.core.choices import RolUsuario
from backend.common.api.permissions import es_rol, es_rol_o_lectura

EscrituraRecetaOLectura = es_rol_o_lectura(RolUsuario.ADMINISTRADOR, RolUsuario.TECNICO_TALLER, RolUsuario.VENDEDOR_B2B)
EscrituraPedidoOLectura = es_rol_o_lectura(RolUsuario.ADMINISTRADOR, RolUsuario.VENDEDOR_B2B)
PuedeConfirmarPedido = es_rol(RolUsuario.ADMINISTRADOR, RolUsuario.VENDEDOR_B2B)
PuedeTransicionarPedido = es_rol(
    RolUsuario.ADMINISTRADOR,
    RolUsuario.VENDEDOR_B2B,
    RolUsuario.ALMACEN,
    RolUsuario.TECNICO_TALLER,
)
