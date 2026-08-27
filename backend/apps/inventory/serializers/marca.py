from rest_framework import serializers

from backend.apps.inventory.models import Marca


class MarcaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Marca
        fields = ('id', 'nombre', 'activo')
        read_only_fields = ('id',)
