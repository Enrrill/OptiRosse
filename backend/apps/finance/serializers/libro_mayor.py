from rest_framework import serializers

from backend.apps.finance.models import LibroMayor
from backend.apps.finance.serializers.pago import PagoResumenSerializer
from backend.apps.orders.serializers.pedido import ClienteResumenSerializer


class LibroMayorSerializer(serializers.ModelSerializer):
    cliente_detalle = ClienteResumenSerializer(source='cliente', read_only=True)
    pedido_numero = serializers.CharField(source='pedido.numero_pedido', read_only=True, allow_null=True)
    pago_detalle = PagoResumenSerializer(source='pago', read_only=True)
    tipo_asiento_display = serializers.CharField(source='get_tipo_asiento_display', read_only=True)
    asiento_origen_id = serializers.IntegerField(source='asiento_origen.id', read_only=True)

    class Meta:
        model = LibroMayor
        fields = (
            'id',
            'cliente',
            'cliente_detalle',
            'pedido',
            'pedido_numero',
            'pago',
            'pago_detalle',
            'tipo_asiento',
            'tipo_asiento_display',
            'monto',
            'saldo_posterior',
            'descripcion',
            'asiento_origen_id',
            'creado_en',
            'actualizado_en',
        )
        read_only_fields = fields
