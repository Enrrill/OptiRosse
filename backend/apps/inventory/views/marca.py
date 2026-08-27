from backend.apps.inventory.models import Marca
from backend.apps.inventory.permissions import EscrituraInventarioOLectura
from backend.apps.inventory.serializers.marca import MarcaSerializer
from backend.common.api.response import api_response
from backend.common.api.viewsets import BaseModelViewSet


class MarcaViewSet(BaseModelViewSet):
    queryset = Marca.objects.all()
    serializer_class = MarcaSerializer
    permission_classes = [EscrituraInventarioOLectura]
    search_fields = ('nombre',)
    ordering = ('nombre',)

    def get_queryset(self):
        queryset = Marca.objects.all()
        if self.action == 'list' and 'activo' not in self.request.query_params:
            queryset = queryset.filter(activo=True)
        return queryset

    def destroy(self, request, *args, **kwargs):
        instancia = self.get_object()
        self._registrar_auditoria('desactivar', instancia)
        instancia.activo = False
        instancia.save(update_fields=['activo'])
        return api_response(message='Marca desactivada correctamente')
