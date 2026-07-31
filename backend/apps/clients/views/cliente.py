from backend.apps.clients.filters import ClienteOpticaFilter
from backend.apps.clients.models import ClienteOptica
from backend.apps.clients.permissions import EscrituraAdministradorOLectura
from backend.apps.clients.serializers.cliente import ClienteOpticaSerializer
from backend.common.api.response import api_response
from backend.common.api.viewsets import BaseModelViewSet


class ClienteOpticaViewSet(BaseModelViewSet):
    queryset = ClienteOptica.objects.all()
    serializer_class = ClienteOpticaSerializer
    permission_classes = [EscrituraAdministradorOLectura]
    filterset_class = ClienteOpticaFilter
    search_fields = ('razon_social', 'nombre_comercial', 'identificacion_fiscal', 'correo')

    def get_queryset(self):
        queryset = ClienteOptica.objects.all()
        if self.action == 'list' and 'activo' not in self.request.query_params:
            queryset = queryset.filter(activo=True)
        return queryset

    def destroy(self, request, *args, **kwargs):
        instancia = self.get_object()
        self._registrar_auditoria('desactivar', instancia)
        instancia.activo = False
        instancia.save(update_fields=['activo', 'actualizado_en'])
        return api_response(message='Cliente desactivado correctamente')
