from rest_framework import serializers
from rest_framework.validators import UniqueValidator

from backend.apps.inventory.models import VarianteProducto


class _ValidacionVarianteMixin:
    def validate(self, attrs):
        if attrs.get('stock', 0) < 0:
            raise serializers.ValidationError({'stock': 'No puede ser un valor negativo'})
        if attrs.get('alerta_stock_minimo', 0) < 0:
            raise serializers.ValidationError({'alerta_stock_minimo': 'No puede ser un valor negativo'})
        if attrs.get('precio_al_mayor', 0) < 0:
            raise serializers.ValidationError({'precio_al_mayor': 'No puede ser un valor negativo'})
        if attrs.get('precio_costo', 0) < 0:
            raise serializers.ValidationError({'precio_costo': 'No puede ser un valor negativo'})

        esfera = attrs.get('esfera')
        if esfera is not None and not (-30 <= esfera <= 30):
            raise serializers.ValidationError({'esfera': 'Debe estar entre -30 y 30'})

        cilindro = attrs.get('cilindro')
        if cilindro is not None and not (-30 <= cilindro <= 30):
            raise serializers.ValidationError({'cilindro': 'Debe estar entre -30 y 30'})

        eje = attrs.get('eje')
        if eje is not None and not (0 <= eje <= 180):
            raise serializers.ValidationError({'eje': 'Debe estar entre 0 y 180'})

        adicion = attrs.get('adicion')
        if adicion is not None and adicion < 0:
            raise serializers.ValidationError({'adicion': 'No puede ser un valor negativo'})

        return attrs


class VarianteProductoSerializer(_ValidacionVarianteMixin, serializers.ModelSerializer):
    codigo_barras = serializers.CharField(max_length=100, required=False, allow_null=True, allow_blank=True)

    class Meta:
        model = VarianteProducto
        fields = (
            'id',
            'producto',
            'sku',
            'codigo_barras',
            'color',
            'tamano',
            'esfera',
            'cilindro',
            'eje',
            'adicion',
            'stock',
            'alerta_stock_minimo',
            'precio_al_mayor',
            'precio_costo',
            'activo',
        )
        read_only_fields = ('id',)
        extra_kwargs = {
            'sku': {
                'validators': [
                    UniqueValidator(
                        queryset=VarianteProducto.objects.all(),
                        message='Este SKU ya está registrado',
                    )
                ]
            }
        }

    def validate_codigo_barras(self, value):
        if value:
            queryset = VarianteProducto.objects.filter(codigo_barras=value)
            if self.instance is not None:
                queryset = queryset.exclude(pk=self.instance.pk)
            if queryset.exists():
                raise serializers.ValidationError('Este código de barras ya está registrado')
        return value


class VarianteEnProductoSerializer(_ValidacionVarianteMixin, serializers.ModelSerializer):
    id = serializers.IntegerField(required=False)
    sku = serializers.CharField(max_length=100)
    codigo_barras = serializers.CharField(max_length=100, required=False, allow_null=True, allow_blank=True)

    class Meta:
        model = VarianteProducto
        fields = (
            'id',
            'sku',
            'codigo_barras',
            'color',
            'tamano',
            'esfera',
            'cilindro',
            'eje',
            'adicion',
            'stock',
            'alerta_stock_minimo',
            'precio_al_mayor',
            'precio_costo',
            'activo',
        )
