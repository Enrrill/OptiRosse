from rest_framework import serializers

from backend.apps.finance.models import MetodoPago


class MetodoPagoSerializer(serializers.ModelSerializer):
    class Meta:
        model = MetodoPago
        fields = ('id', 'nombre', 'moneda', 'requiere_referencia', 'activo')
        read_only_fields = ('id',)
