from rest_framework import serializers
from rest_framework.validators import UniqueValidator

from backend.apps.clients.models import ClienteOptica
from backend.common.utils import SanitizedSerializerMixin, validate_rif_format


class ClienteOpticaSerializer(SanitizedSerializerMixin, serializers.ModelSerializer):
    class Meta:
        model = ClienteOptica
        fields = (
            'id',
            'razon_social',
            'nombre_comercial',
            'identificacion_fiscal',
            'correo',
            'telefono',
            'direccion',
            'limite_credito',
            'dias_credito',
            'activo',
            'creado_en',
            'actualizado_en',
        )
        read_only_fields = ('id', 'creado_en', 'actualizado_en')
        extra_kwargs = {
            'identificacion_fiscal': {
                'validators': [
                    UniqueValidator(
                        queryset=ClienteOptica.objects.all(),
                        message='Esta identificación fiscal ya está registrada',
                    )
                ]
            }
        }

    def validate(self, attrs):
        if attrs.get('limite_credito', 0) < 0:
            raise serializers.ValidationError({'limite_credito': 'No puede ser un valor negativo'})
        if attrs.get('dias_credito', 0) < 0:
            raise serializers.ValidationError({'dias_credito': 'No puede ser un valor negativo'})
        return attrs
