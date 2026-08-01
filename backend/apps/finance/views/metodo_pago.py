from backend.apps.finance.filters import MetodoPagoFilter
from backend.apps.finance.models import MetodoPago
from backend.apps.finance.permissions import EscrituraMetodoPagoOLectura
from backend.apps.finance.serializers.metodo_pago import MetodoPagoSerializer
from backend.common.api.response import api_response
from backend.common.api.viewsets import BaseModelViewSet


class MetodoPagoViewSet(BaseModelViewSet):
    queryset = MetodoPago.objects.all()
    serializer_class = MetodoPagoSerializer
    permission_classes = [EscrituraMetodoPagoOLectura]
    filterset_class = MetodoPagoFilter
    search_fields = ('nombre', 'moneda')
    ordering = ('nombre',)

    def get_queryset(self):
        queryset = MetodoPago.objects.all()
        if self.action == 'list' and 'activo' not in self.request.query_params:
            queryset = queryset.filter(activo=True)
        return queryset

    def destroy(self, request, *args, **kwargs):
        instancia = self.get_object()
        self._registrar_auditoria('desactivar', instancia)
        instancia.activo = False
        instancia.save(update_fields=['activo'])
        return api_response(message='Método de pago desactivado correctamente')
