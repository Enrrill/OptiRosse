from django.http import HttpResponse
from django.shortcuts import get_object_or_404

from rest_framework.views import APIView

from backend.apps.document_engine.models import PlantillaDocumento
from backend.apps.document_engine.permissions import PuedeGenerarDocumento
from backend.apps.document_engine.serializers.plantilla import GenerarDocumentoSerializer
from backend.apps.document_engine.services import DocumentoService
from backend.common.api.exceptions import ApiError


class GenerarDocumentoView(APIView):
    permission_classes = [PuedeGenerarDocumento]

    def post(self, request, pk):
        serializer = GenerarDocumentoSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        plantilla = get_object_or_404(PlantillaDocumento.objects.all(), pk=pk)
        if not plantilla.activo:
            raise ApiError(
                'La plantilla está desactivada',
                status_code=409,
                code='plantilla_inactiva',
            )

        documento = DocumentoService.generar(
            plantilla,
            objeto_id=serializer.validated_data['objeto_id'],
            formato=serializer.validated_data['formato'],
            usuario=request.user,
            direccion_ip=request.META.get('REMOTE_ADDR', ''),
        )

        response = HttpResponse(
            documento.contenido,
            content_type=documento.content_type,
        )
        response['Content-Disposition'] = f'attachment; filename="{documento.nombre_archivo}"'
        return response
