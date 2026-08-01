from rest_framework import serializers

from backend.apps.orders.models import RecetaOptica


class RecetaOpticaSerializer(serializers.ModelSerializer):
    class Meta:
        model = RecetaOptica
        fields = (
            'id',
            'nombre_paciente',
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
        )
        read_only_fields = ('id',)

    def validate(self, attrs):
        for campo in ('od_esfera', 'oi_esfera'):
            valor = attrs.get(campo)
            if valor is not None and not (-30 <= valor <= 30):
                raise serializers.ValidationError({campo: 'Debe estar entre -30 y 30'})

        for campo in ('od_cilindro', 'oi_cilindro'):
            valor = attrs.get(campo)
            if valor is not None and not (-30 <= valor <= 30):
                raise serializers.ValidationError({campo: 'Debe estar entre -30 y 30'})

        for campo in ('od_eje', 'oi_eje'):
            valor = attrs.get(campo)
            if valor is not None and not (0 <= valor <= 180):
                raise serializers.ValidationError({campo: 'Debe estar entre 0 y 180'})

        for campo in ('od_adicion', 'oi_adicion'):
            valor = attrs.get(campo)
            if valor is not None and valor < 0:
                raise serializers.ValidationError({campo: 'No puede ser un valor negativo'})

        return attrs
