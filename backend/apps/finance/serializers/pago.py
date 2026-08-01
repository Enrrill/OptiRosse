from django.utils import timezone

from rest_framework import serializers

from backend.apps.finance.models import Pago
from backend.apps.finance.services import PagoService
from backend.apps.orders.serializers.pedido import ClienteResumenSerializer


class PagoResumenSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pago
        fields = ('id', 'monto', 'estado', 'numero_referencia')


class PagoSerializer(serializers.ModelSerializer):
    cliente_detalle = ClienteResumenSerializer(source='cliente', read_only=True)
    pedido_numero = serializers.CharField(source='pedido.numero_pedido', read_only=True, allow_null=True)
    metodo_pago_detalle = serializers.CharField(source='metodo_pago.nombre', read_only=True)
    estado_display = serializers.CharField(source='get_estado_display', read_only=True)
    fecha_pago = serializers.DateTimeField(required=False, default=timezone.now)

    class Meta:
        model = Pago
        fields = (
            'id',
            'cliente',
            'cliente_detalle',
            'pedido',
            'pedido_numero',
            'metodo_pago',
            'metodo_pago_detalle',
            'monto',
            'tasa_cambio',
            'numero_referencia',
            'comprobante_imagen_url',
            'estado',
            'estado_display',
            'fecha_pago',
            'motivo_rechazo',
            'creado_en',
            'actualizado_en',
        )
        read_only_fields = (
            'id',
            'estado',
            'estado_display',
            'motivo_rechazo',
            'creado_en',
            'actualizado_en',
        )

    def validate(self, attrs):
        monto = attrs.get('monto')
        if monto is not None and monto <= 0:
            raise serializers.ValidationError({'monto': 'El monto debe ser mayor a cero'})

        tasa_cambio = attrs.get('tasa_cambio')
        if tasa_cambio is not None and tasa_cambio <= 0:
            raise serializers.ValidationError({'tasa_cambio': 'La tasa de cambio debe ser mayor a cero'})

        pedido = attrs.get('pedido')
        if pedido is not None:
            cliente = attrs.get('cliente')
            if cliente is None:
                attrs['cliente'] = pedido.cliente
            elif cliente.pk != pedido.cliente_id:
                raise serializers.ValidationError(
                    {'cliente': 'El cliente del pago no coincide con el cliente del pedido'}
                )

        return attrs

    def create(self, validated_data):
        usuario = self.context['request'].user
        direccion_ip = self.context['request'].META.get('REMOTE_ADDR', '')
        return PagoService.crear(validated_data, usuario=usuario, direccion_ip=direccion_ip)
