from rest_framework import serializers

from backend.apps.document_engine.models import PlantillaDocumento


class PlantillaDocumentoSerializer(serializers.ModelSerializer):
    tipo_documento_display = serializers.CharField(source='get_tipo_documento_display', read_only=True)

    class Meta:
        model = PlantillaDocumento
        fields = (
            'id',
            'nombre',
            'tipo_documento',
            'tipo_documento_display',
            'contenido_html',
            'estilos_css',
            'activo',
            'actualizado_en',
        )
        read_only_fields = ('id', 'actualizado_en')

    def validate_contenido_html(self, valor):
        if not valor or not valor.strip():
            raise serializers.ValidationError('El contenido HTML no puede estar vacío')
        return valor


class GenerarDocumentoSerializer(serializers.Serializer):
    objeto_id = serializers.IntegerField()
    formato = serializers.ChoiceField(choices=('html', 'pdf'), default='html')
