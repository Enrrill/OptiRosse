from rest_framework import serializers

from backend.apps.clients.models import ClienteOptica
from backend.apps.orders.models import Pedido, RecetaOptica
from backend.apps.orders.serializers.detalle import DetalleEnPedidoSerializer
from backend.apps.orders.serializers.receta import RecetaOpticaSerializer
from backend.apps.orders.services import PedidoService


class ClienteResumenSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClienteOptica
        fields = ('id', 'razon_social', 'nombre_comercial', 'identificacion_fiscal')


class PedidoSerializer(serializers.ModelSerializer):
    cliente_detalle = ClienteResumenSerializer(source='cliente', read_only=True)
    usuario_nombre = serializers.CharField(source='usuario.nombre_usuario', read_only=True)
    receta_detalle = RecetaOpticaSerializer(source='receta', read_only=True)
    detalles = DetalleEnPedidoSerializer(many=True, required=False)

    class Meta:
        model = Pedido
        fields = (
            'id',
            'numero_pedido',
            'cliente',
            'cliente_detalle',
            'usuario',
            'usuario_nombre',
            'receta',
            'receta_detalle',
            'estado',
            'subtotal',
            'impuesto',
            'total',
            'notas',
            'detalles',
            'creado_en',
            'actualizado_en',
        )
        read_only_fields = (
            'id',
            'numero_pedido',
            'usuario',
            'usuario_nombre',
            'estado',
            'subtotal',
            'impuesto',
            'total',
            'creado_en',
            'actualizado_en',
        )

    def validate(self, attrs):
        detalles = attrs.get('detalles', [])
        if detalles:
            variantes = [d['variante'] for d in detalles if d.get('variante')]
            if len(variantes) != len(set(variantes)):
                raise serializers.ValidationError(
                    {'detalles': 'Hay variantes repetidas en el mismo pedido'}
                )

        receta = attrs.get('receta')
        if receta is not None:
            queryset = Pedido.objects.filter(receta=receta)
            if self.instance is not None:
                queryset = queryset.exclude(pk=self.instance.pk)
            if queryset.exists():
                raise serializers.ValidationError(
                    {'receta': 'Esta receta ya está asociada a otro pedido'}
                )

        return attrs

    def create(self, validated_data):
        usuario = self.context['request'].user
        direccion_ip = self.context['request'].META.get('REMOTE_ADDR', '')
        pedido = PedidoService.crear(validated_data, usuario=usuario, direccion_ip=direccion_ip)
        return pedido

    def update(self, instance, validated_data):
        usuario = self.context['request'].user
        direccion_ip = self.context['request'].META.get('REMOTE_ADDR', '')
        pedido = PedidoService.actualizar(
            instance,
            validated_data,
            usuario=usuario,
            direccion_ip=direccion_ip,
        )
        return pedido
