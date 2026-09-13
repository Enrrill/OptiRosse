from backend.apps.core.choices import RolUsuario
from backend.common.api.permissions import es_rol_o_lectura

EscrituraPacienteOLectura = es_rol_o_lectura(RolUsuario.ADMINISTRADOR, RolUsuario.VENDEDORA)
