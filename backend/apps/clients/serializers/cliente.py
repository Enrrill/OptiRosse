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
        limite = attrs.get('limite_credito')
        dias = attrs.get('dias_credito')

        if limite is not None and limite < 0:
            raise serializers.ValidationError({'limite_credito': 'No puede ser un valor negativo'})
        if dias is not None and dias < 0:
            raise serializers.ValidationError({'dias_credito': 'No puede ser un valor negativo'})
        if dias is not None and limite is None:
            raise serializers.ValidationError(
                {'dias_credito': 'No se pueden asignar días de crédito sin un límite de crédito'}
            )

        return attrs
