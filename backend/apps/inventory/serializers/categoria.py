from rest_framework import serializers
from rest_framework.validators import UniqueTogetherValidator

from backend.apps.inventory.models import Categoria


class CategoriaResumenSerializer(serializers.ModelSerializer):
    tipo_producto_display = serializers.CharField(source='get_tipo_producto_display', read_only=True)

    class Meta:
        model = Categoria
        fields = ('id', 'nombre', 'tipo_producto', 'tipo_producto_display')


class CategoriaSerializer(CategoriaResumenSerializer):
    class Meta(CategoriaResumenSerializer.Meta):
        fields = ('id', 'nombre', 'tipo_producto', 'tipo_producto_display', 'activo')
        read_only_fields = ('id',)
        validators = [
            UniqueTogetherValidator(
                queryset=Categoria.objects.all(),
                fields=('tipo_producto', 'nombre'),
                message='Ya existe una categoría con este tipo de producto y nombre',
            )
        ]
