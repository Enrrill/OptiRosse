from backend.apps.orders.filters import RecetaOpticaFilter
from backend.apps.orders.models import RecetaOptica
from backend.apps.orders.permissions import EscrituraRecetaOLectura
from backend.apps.orders.serializers.receta import RecetaOpticaSerializer
from backend.common.api.response import api_response
from backend.common.api.viewsets import BaseModelViewSet


class RecetaOpticaViewSet(BaseModelViewSet):
    queryset = RecetaOptica.objects.all()
    serializer_class = RecetaOpticaSerializer
    permission_classes = [EscrituraRecetaOLectura]
    filterset_class = RecetaOpticaFilter
    search_fields = ('nombre_paciente',)
    ordering = ('-id',)

    def get_queryset(self):
        queryset = RecetaOptica.objects.all()
        if self.action == 'list' and 'activo' not in self.request.query_params:
            queryset = queryset.filter(activo=True)
        return queryset

    def destroy(self, request, *args, **kwargs):
        instancia = self.get_object()
        self._registrar_auditoria('desactivar', instancia)
        instancia.activo = False
        instancia.save(update_fields=['activo'])
        return api_response(message='Receta desactivada correctamente')
