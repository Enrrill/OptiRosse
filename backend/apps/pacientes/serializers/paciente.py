from rest_framework import serializers
from rest_framework.validators import UniqueValidator

from backend.apps.clients.models import ClienteOptica
from backend.apps.pacientes.models import Paciente
from backend.common.utils import SanitizedSerializerMixin


class ClienteOpticaResumenSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClienteOptica
        fields = ('id', 'razon_social', 'nombre_comercial', 'identificacion_fiscal')


class PacienteSerializer(SanitizedSerializerMixin, serializers.ModelSerializer):
    cliente_optica_detalle = ClienteOpticaResumenSerializer(source='cliente_optica', read_only=True)
    nombre_completo = serializers.SerializerMethodField()

    class Meta:
        model = Paciente
        fields = (
            'id',
            'nombre',
            'apellido',
            'nombre_completo',
            'cedula',
            'telefono',
            'correo',
            'fecha_nacimiento',
            'notas',
            'cliente_optica',
            'cliente_optica_detalle',
            'activo',
            'creado_en',
            'actualizado_en',
        )
        read_only_fields = ('id', 'creado_en', 'actualizado_en', 'nombre_completo')
        extra_kwargs = {
            'cedula': {
                'validators': [
                    UniqueValidator(
                        queryset=Paciente.objects.all(),
                        message='Esta cédula ya está registrada en otro paciente',
                    )
                ]
            }
        }

    def get_nombre_completo(self, obj):
        if obj.apellido:
            return f'{obj.nombre} {obj.apellido}'
        return obj.nombre

    def validate_nombre(self, value):
        if not value or len(value.strip()) < 2:
            raise serializers.ValidationError('El nombre debe tener al menos 2 caracteres.')
        return value
