from rest_framework import serializers

from backend.apps.inventory.models import VarianteProducto
from backend.apps.orders.models import DetallePedido


class VarianteResumenSerializer(serializers.ModelSerializer):
    producto_marca = serializers.CharField(source='producto.marca', read_only=True)
    producto_codigo_modelo = serializers.CharField(source='producto.codigo_modelo', read_only=True)

    class Meta:
        model = VarianteProducto
        fields = (
            'id',
            'sku',
            'producto_marca',
            'producto_codigo_modelo',
            'color',
            'tamano',
            'esfera',
            'cilindro',
            'eje',
            'adicion',
        )


class DetalleEnPedidoSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(required=False)
    variante_detalle = VarianteResumenSerializer(source='variante', read_only=True)
    precio_unitario = serializers.DecimalField(max_digits=12, decimal_places=2, required=False)

    class Meta:
        model = DetallePedido
        fields = (
            'id',
            'variante',
            'variante_detalle',
            'cantidad',
            'precio_unitario',
            'precio_total',
        )
        read_only_fields = ('precio_total',)

    def validate(self, attrs):
        variante = attrs.get('variante')
        if variante is None and self.instance is not None:
            variante = self.instance.variante

        if attrs.get('precio_unitario') is None:
            if variante is None:
                raise serializers.ValidationError({'precio_unitario': 'Este campo es obligatorio'})
            attrs['precio_unitario'] = variante.precio_al_mayor

        if attrs.get('cantidad', 1) < 1:
            raise serializers.ValidationError({'cantidad': 'La cantidad debe ser mayor o igual a 1'})
        if attrs['precio_unitario'] < 0:
            raise serializers.ValidationError({'precio_unitario': 'No puede ser un valor negativo'})
        return attrs
