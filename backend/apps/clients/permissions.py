from backend.apps.core.choices import RolUsuario
from backend.common.api.permissions import es_rol_o_lectura

EscrituraAdministradorOLectura = es_rol_o_lectura(RolUsuario.ADMINISTRADOR)
