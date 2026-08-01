from backend.apps.core.choices import RolUsuario
from backend.common.api.permissions import es_rol, es_rol_o_lectura

EscrituraPlantillaOLectura = es_rol_o_lectura(RolUsuario.ADMINISTRADOR)
PuedeGenerarDocumento = es_rol(RolUsuario.ADMINISTRADOR, RolUsuario.CONTABILIDAD, RolUsuario.VENDEDOR_B2B)
