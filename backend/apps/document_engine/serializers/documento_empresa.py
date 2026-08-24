import os
from rest_framework import serializers

from backend.apps.document_engine.models import DocumentoEmpresa

EXTENSIONES_PERMITIDAS = {
    'pdf',
    'docx',
    'doc',
    'xlsx',
    'xls',
    'png',
    'jpg',
    'jpeg',
    'csv',
    'zip',
}
TAMANO_MAXIMO_BYTES = 15 * 1024 * 1024  # 15 MB


class DocumentoEmpresaSerializer(serializers.ModelSerializer):
    categoria_display = serializers.CharField(source='get_categoria_display', read_only=True)
    creado_por_nombre = serializers.SerializerMethodField()
    archivo_url = serializers.SerializerMethodField()

    class Meta:
        model = DocumentoEmpresa
        fields = (
            'id',
            'nombre',
            'descripcion',
            'categoria',
            'categoria_display',
            'archivo',
            'archivo_url',
            'extension',
            'tamano_bytes',
            'version',
            'es_plantilla_generable',
            'variables_schema',
            'creado_por',
            'creado_por_nombre',
            'activo',
            'creado_en',
            'actualizado_en',
        )
        read_only_fields = (
            'id',
            'extension',
            'tamano_bytes',
            'creado_por',
            'creado_por_nombre',
            'archivo_url',
            'creado_en',
            'actualizado_en',
        )

    def get_creado_por_nombre(self, obj):
        if obj.creado_por:
            nombre = f'{obj.creado_por.nombre} {obj.creado_por.apellido}'.strip()
            return nombre or obj.creado_por.nombre_usuario
        return None

    def get_archivo_url(self, obj):
        if not obj.archivo:
            return None
        request = self.context.get('request')
        if request is not None:
            return request.build_absolute_uri(obj.archivo.url)
        return obj.archivo.url

    def validate_archivo(self, archivo):
        if not archivo:
            return archivo

        ext = os.path.splitext(archivo.name)[1].lower().lstrip('.')
        if ext not in EXTENSIONES_PERMITIDAS:
            raise serializers.ValidationError(
                f'Extensión .{ext} no permitida. Formatos válidos: {", ".join(sorted(EXTENSIONES_PERMITIDAS))}.'
            )

        if archivo.size > TAMANO_MAXIMO_BYTES:
            raise serializers.ValidationError(
                f'El archivo excede el tamaño máximo permitido de 15 MB (tamaño actual: {round(archivo.size / (1024 * 1024), 2)} MB).'
            )

        return archivo


class GenerarDocxPayloadSerializer(serializers.Serializer):
    datos_contexto = serializers.DictField(
        required=True,
        help_text='Diccionario de variables a inyectar en la plantilla Word Jinja2.',
    )
