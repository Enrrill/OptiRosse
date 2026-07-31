from backend.apps.inventory.filters import ProductoFilter
from backend.apps.inventory.models import Producto
from backend.apps.inventory.permissions import EscrituraInventarioOLectura
from backend.apps.inventory.serializers.producto import ProductoSerializer
from backend.common.api.response import api_response
from backend.common.api.viewsets import BaseModelViewSet


class ProductoViewSet(BaseModelViewSet):
    queryset = Producto.objects.select_related('categoria').prefetch_related('variantes').all()
    serializer_class = ProductoSerializer
    permission_classes = [EscrituraInventarioOLectura]
    filterset_class = ProductoFilter
    search_fields = ('marca', 'codigo_modelo', 'descripcion', 'categoria__nombre')

    def get_queryset(self):
        queryset = self.queryset
        if self.action == 'list' and 'activo' not in self.request.query_params:
            queryset = queryset.filter(activo=True)
        return queryset

    def destroy(self, request, *args, **kwargs):
        instancia = self.get_object()
        self._registrar_auditoria('desactivar', instancia)
        instancia.activo = False
        instancia.save(update_fields=['activo', 'actualizado_en'])
        return api_response(message='Producto desactivado correctamente')
