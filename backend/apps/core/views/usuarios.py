from backend.apps.core.models import Usuario
from backend.apps.core.permissions import EsAdministrador
from backend.apps.core.serializers.usuario import UsuarioSerializer
from backend.common.api.response import api_response
from backend.common.api.viewsets import BaseModelViewSet


class UsuarioViewSet(BaseModelViewSet):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer
    permission_classes = [EsAdministrador]
    search_fields = ('nombre_usuario', 'correo', 'nombre', 'apellido')

    def destroy(self, request, *args, **kwargs):
        instancia = self.get_object()
        self._registrar_auditoria('desactivar', instancia)
        instancia.activo = False
        instancia.save(update_fields=['activo', 'actualizado_en'])
        return api_response(message='Usuario desactivado correctamente')
