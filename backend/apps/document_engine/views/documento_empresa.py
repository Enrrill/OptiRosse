from django.http import HttpResponse
from rest_framework.decorators import action

from backend.apps.document_engine.filters import DocumentoEmpresaFilter
from backend.apps.document_engine.models import DocumentoEmpresa
from backend.apps.document_engine.permissions import EscrituraPlantillaOLectura
from backend.apps.document_engine.serializers.documento_empresa import (
    DocumentoEmpresaSerializer,
    GenerarDocxPayloadSerializer,
)
from backend.apps.document_engine.services import GeneradorDocxService
from backend.common.api.response import api_response
from backend.common.api.viewsets import BaseModelViewSet


class DocumentoEmpresaViewSet(BaseModelViewSet):
    queryset = DocumentoEmpresa.objects.all()
    serializer_class = DocumentoEmpresaSerializer
    permission_classes = [EscrituraPlantillaOLectura]
    filterset_class = DocumentoEmpresaFilter
    search_fields = ('nombre', 'descripcion')
    ordering = ('-creado_en',)

    def get_queryset(self):
        queryset = self.queryset
        if self.action == 'list' and not self.request.query_params.get('activo'):
            queryset = queryset.filter(activo=True)
        return queryset

    def perform_create(self, serializer):
        serializer.save(creado_por=self.request.user)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.activo = False
        instance.save(update_fields=['activo', 'actualizado_en'])
        self._registrar_auditoria('desactivar', instance)
        return api_response(message='Documento desactivado correctamente')

    @action(detail=True, methods=['post'], url_path='reactivar')
    def reactivar(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.activo = True
        instance.save(update_fields=['activo', 'actualizado_en'])
        self._registrar_auditoria('actualizar', instance)
        return api_response(message='Documento reactivado correctamente')

    @action(detail=True, methods=['get'], url_path='descargar')
    def descargar(self, request, *args, **kwargs):
        instance = self.get_object()
        if not instance.archivo or not instance.archivo.name:
            return api_response(
                message='El documento no tiene un archivo disponible',
                status=400,
            )

        nombre_archivo = instance.archivo.name.split('/')[-1]
        response = HttpResponse(instance.archivo.read(), content_type='application/octet-stream')
        response['Content-Disposition'] = f'attachment; filename="{nombre_archivo}"'
        return response

    @action(detail=True, methods=['post'], url_path='generar-docx')
    def generar_docx(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = GenerarDocxPayloadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        datos_contexto = serializer.validated_data['datos_contexto']
        ip_cliente = request.META.get('REMOTE_ADDR', '')

        doc_generado = GeneradorDocxService.generar(
            documento_empresa=instance,
            datos_contexto=datos_contexto,
            usuario=request.user,
            direccion_ip=ip_cliente,
        )

        response = HttpResponse(doc_generado.contenido, content_type=doc_generado.content_type)
        response['Content-Disposition'] = f'attachment; filename="{doc_generado.nombre_archivo}"'
        return response
