from django.db import transaction

from rest_framework import serializers

from backend.apps.inventory.models import Producto, VarianteProducto
from backend.apps.inventory.serializers.categoria import CategoriaResumenSerializer
from backend.apps.inventory.serializers.variante import VarianteEnProductoSerializer, VarianteProductoSerializer


class ProductoSerializer(serializers.ModelSerializer):
    categoria_detalle = CategoriaResumenSerializer(source='categoria', read_only=True)
    variantes = VarianteEnProductoSerializer(many=True, required=False)

    class Meta:
        model = Producto
        fields = (
            'id',
            'categoria',
            'categoria_detalle',
            'marca',
            'codigo_modelo',
            'descripcion',
            'indice_refraccion',
            'material',
            'tratamiento',
            'diseno',
            'activo',
            'creado_en',
            'actualizado_en',
            'variantes',
        )
        read_only_fields = ('id', 'creado_en', 'actualizado_en')

    def validate(self, attrs):
        variantes = attrs.get('variantes', [])
        if variantes:
            skus = [v['sku'] for v in variantes if v.get('sku')]
            codigos = [v['codigo_barras'] for v in variantes if v.get('codigo_barras')]
            if len(skus) != len(set(skus)):
                raise serializers.ValidationError({'variantes': 'Hay SKUs duplicados en el mismo producto'})
            if len(codigos) != len(set(codigos)):
                raise serializers.ValidationError(
                    {'variantes': 'Hay códigos de barras duplicados en el mismo producto'}
                )
            if self.instance is None:
                for v in variantes:
                    if v.get('id'):
                        raise serializers.ValidationError(
                            {'variantes': 'No se puede asignar un id a una variante nueva'}
                        )
        return attrs

    def create(self, validated_data):
        variantes_data = validated_data.pop('variantes', [])
        with transaction.atomic():
            producto = Producto.objects.create(**validated_data)
            for item in variantes_data:
                serializer = VarianteProductoSerializer(data={**item, 'producto': producto.pk})
                serializer.is_valid(raise_exception=True)
                serializer.save()
        return producto

    def update(self, instance, validated_data):
        variantes_data = validated_data.pop('variantes', None)
        with transaction.atomic():
            for attr, value in validated_data.items():
                setattr(instance, attr, value)
            instance.save()

            if variantes_data is not None:
                ids_mantenidos = []

                for item in variantes_data:
                    variante_id = item.get('id')
                    if variante_id:
                        variante = VarianteProducto.objects.filter(pk=variante_id, producto=instance).first()
                        if variante is None:
                            raise serializers.ValidationError(
                                {'variantes': f'La variante {variante_id} no pertenece a este producto'}
                            )
                        serializer = VarianteProductoSerializer(
                            variante,
                            data={**item, 'producto': variante.producto_id},
                            partial=True,
                        )
                        serializer.is_valid(raise_exception=True)
                        serializer.save()
                        ids_mantenidos.append(variante_id)
                    else:
                        serializer = VarianteProductoSerializer(data={**item, 'producto': instance.pk})
                        serializer.is_valid(raise_exception=True)
                        variante_nueva = serializer.save()
                        ids_mantenidos.append(variante_nueva.pk)

                VarianteProducto.objects.filter(producto=instance).exclude(pk__in=ids_mantenidos).update(
                    activo=False
                )

        return instance
