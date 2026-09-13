from rest_framework import serializers

from backend.apps.orders.models import RecetaOptica
from backend.apps.pacientes.models import Paciente
from backend.common.utils import SanitizedSerializerMixin


class PacienteResumenSerializer(serializers.ModelSerializer):
    nombre_completo = serializers.SerializerMethodField()

    class Meta:
        model = Paciente
        fields = ('id', 'nombre', 'apellido', 'nombre_completo', 'cedula', 'telefono')

    def get_nombre_completo(self, obj):
        if obj.apellido:
            return f'{obj.nombre} {obj.apellido}'
        return obj.nombre


class RecetaOpticaSerializer(SanitizedSerializerMixin, serializers.ModelSerializer):
    paciente_detalle = PacienteResumenSerializer(source='paciente', read_only=True)

    class Meta:
        model = RecetaOptica
        fields = (
            'id',
            'paciente',
            'paciente_detalle',
            'medico_prescriptor',
            'od_esfera',
            'od_cilindro',
            'od_eje',
            'od_adicion',
            'oi_esfera',
            'oi_cilindro',
            'oi_eje',
            'oi_adicion',
            'distancia_pupilar',
            'notas',
            'activo',
            'creado_en',
            'actualizado_en',
        )
        read_only_fields = ('id', 'creado_en', 'actualizado_en')

    def validate(self, attrs):
        def get_val(field_name):
            if field_name in attrs:
                return attrs[field_name]
            if self.instance:
                return getattr(self.instance, field_name, None)
            return None

        # 1. Validar rangos de campos individuales
        for campo in ('od_esfera', 'oi_esfera', 'od_cilindro', 'oi_cilindro'):
            valor = get_val(campo)
            if valor is not None and not (-30 <= valor <= 30):
                raise serializers.ValidationError({campo: 'Debe estar entre -30 y 30'})

        for campo in ('od_eje', 'oi_eje'):
            valor = get_val(campo)
            if valor is not None and not (0 <= valor <= 180):
                raise serializers.ValidationError({campo: 'Debe estar entre 0 y 180'})

        for campo in ('od_adicion', 'oi_adicion'):
            valor = get_val(campo)
            if valor is not None and valor < 0:
                raise serializers.ValidationError({campo: 'No puede ser un valor negativo'})

        dp = get_val('distancia_pupilar')
        if dp is not None and not (40 <= dp <= 80):
            raise serializers.ValidationError({
                'distancia_pupilar': 'La distancia pupilar debe estar entre 40 y 80 mm'
            })

        # 2. Dependencia Cilindro vs Eje para cada ojo
        for lado in ('od', 'oi'):
            cilindro = get_val(f'{lado}_cilindro')
            eje = get_val(f'{lado}_eje')

            if cilindro is not None and cilindro != 0 and eje is None:
                raise serializers.ValidationError({
                    f'{lado}_eje': 'El eje es obligatorio si se indica cilindro'
                })

            if eje is not None and (cilindro is None or cilindro == 0):
                raise serializers.ValidationError({
                    f'{lado}_cilindro': 'Debe indicar un cilindro válido para el eje especificado'
                })

        # 3. Al menos algún dato de graduación u óptico presente
        valores_opticos = [
            get_val('od_esfera'),
            get_val('od_cilindro'),
            get_val('od_adicion'),
            get_val('oi_esfera'),
            get_val('oi_cilindro'),
            get_val('oi_adicion'),
            get_val('distancia_pupilar'),
        ]

        if all(v is None for v in valores_opticos):
            raise serializers.ValidationError({
                'non_field_errors': 'Debe ingresar la graduación de al menos un ojo (Esfera/Cilindro) o la distancia pupilar'
            })

        return attrs
