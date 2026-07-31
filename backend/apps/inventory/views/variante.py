from backend.apps.inventory.filters import VarianteProductoFilter
from backend.apps.inventory.models import VarianteProducto
from backend.apps.inventory.permissions import EscrituraInventarioOLectura
from backend.apps.inventory.serializers.variante import VarianteProductoSerializer
from backend.common.api.response import api_response
from backend.common.api.viewsets import BaseModelViewSet


class VarianteProductoViewSet(BaseModelViewSet):
    queryset = (
        VarianteProducto.objects.select_related('producto', 'producto__categoria').all()
    )
    serializer_class = VarianteProductoSerializer
    permission_classes = [EscrituraInventarioOLectura]
    filterset_class = VarianteProductoFilter
    search_fields = ('sku', 'codigo_barras', 'producto__marca', 'producto__codigo_modelo')
    ordering = ('-id',)

    def get_queryset(self):
        queryset = self.queryset
        if self.action == 'list' and 'activo' not in self.request.query_params:
            queryset = queryset.filter(activo=True)
        return queryset

    def destroy(self, request, *args, **kwargs):
        instancia = self.get_object()
        self._registrar_auditoria('desactivar', instancia)
        instancia.activo = False
        instancia.save(update_fields=['activo'])
        return api_response(message='Variante desactivada correctamente')
