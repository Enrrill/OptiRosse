from backend.apps.inventory.filters import CategoriaFilter
from backend.apps.inventory.models import Categoria
from backend.apps.inventory.permissions import EscrituraInventarioOLectura
from backend.apps.inventory.serializers.categoria import CategoriaSerializer
from backend.common.api.response import api_response
from backend.common.api.viewsets import BaseModelViewSet


class CategoriaViewSet(BaseModelViewSet):
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer
    permission_classes = [EscrituraInventarioOLectura]
    filterset_class = CategoriaFilter
    search_fields = ('nombre',)
    ordering = ('nombre',)

    def get_queryset(self):
        queryset = Categoria.objects.all()
        if self.action == 'list' and 'activo' not in self.request.query_params:
            queryset = queryset.filter(activo=True)
        return queryset

    def destroy(self, request, *args, **kwargs):
        instancia = self.get_object()
        self._registrar_auditoria('desactivar', instancia)
        instancia.activo = False
        instancia.save(update_fields=['activo'])
        return api_response(message='Categoría desactivada correctamente')
