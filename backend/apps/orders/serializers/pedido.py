from rest_framework import serializers

from backend.apps.clients.models import ClienteOptica
from backend.apps.orders.models import Pedido
from backend.apps.orders.serializers.detalle import DetalleEnPedidoSerializer
from backend.apps.orders.serializers.receta import PacienteResumenSerializer, RecetaOpticaSerializer
from backend.apps.orders.services import PedidoService
from backend.common.utils import SanitizedSerializerMixin


class ClienteResumenSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClienteOptica
        fields = ('id', 'razon_social', 'nombre_comercial', 'identificacion_fiscal')


class PedidoSerializer(SanitizedSerializerMixin, serializers.ModelSerializer):
    cliente_detalle = ClienteResumenSerializer(source='cliente', read_only=True)
    paciente_detalle = PacienteResumenSerializer(source='paciente', read_only=True)
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
            'paciente',
            'paciente_detalle',
            'usuario',
            'usuario_nombre',
            'tipo_pedido',
            'receta',
            'receta_detalle',
            'receta_snapshot',
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
            'receta_snapshot',
            'estado',
            'subtotal',
            'impuesto',
            'total',
            'creado_en',
            'actualizado_en',
        )

    def validate(self, attrs):
        # 1. Validar variantes repetidas
        detalles = attrs.get('detalles', [])
        if detalles:
            variantes = [d['variante'] for d in detalles if d.get('variante')]
            if len(variantes) != len(set(variantes)):
                raise serializers.ValidationError(
                    {'detalles': 'Hay variantes repetidas en el mismo pedido'}
                )

        # 2. Validar destinatario único (cliente o paciente)
        cliente = attrs.get('cliente') if 'cliente' in attrs else getattr(self.instance, 'cliente', None)
        paciente = attrs.get('paciente') if 'paciente' in attrs else getattr(self.instance, 'paciente', None)

        if bool(cliente) == bool(paciente):
            raise serializers.ValidationError(
                'Debe especificar exactamente un destinatario: cliente óptica o paciente.'
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
