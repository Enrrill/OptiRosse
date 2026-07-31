from backend.apps.core.choices import RolUsuario
from backend.common.api.permissions import es_rol

EsAdministrador = es_rol(RolUsuario.ADMINISTRADOR)
