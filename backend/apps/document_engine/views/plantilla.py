from backend.apps.document_engine.filters import PlantillaDocumentoFilter
from backend.apps.document_engine.models import PlantillaDocumento
from backend.apps.document_engine.permissions import EscrituraPlantillaOLectura
from backend.apps.document_engine.serializers.plantilla import PlantillaDocumentoSerializer
from backend.common.api.viewsets import BaseModelViewSet


class PlantillaDocumentoViewSet(BaseModelViewSet):
    queryset = PlantillaDocumento.objects.all()
    serializer_class = PlantillaDocumentoSerializer
    permission_classes = [EscrituraPlantillaOLectura]
    filterset_class = PlantillaDocumentoFilter
    search_fields = ('nombre',)
    ordering = ('tipo_documento',)

    def get_queryset(self):
        queryset = self.queryset
        if self.action == 'list' and not self.request.query_params.get('activo'):
            queryset = queryset.filter(activo=True)
        return queryset

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.activo = False
        instance.save(update_fields=['activo', 'actualizado_en'])
        self._registrar_auditoria('desactivar', instance)
        from backend.common.api.response import api_response

        return api_response(message='Plantilla desactivada correctamente')
