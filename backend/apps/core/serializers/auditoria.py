from rest_framework import serializers

from backend.apps.core.models import RegistroAuditoria


class RegistroAuditoriaSerializer(serializers.ModelSerializer):
    usuario_detalle = serializers.SerializerMethodField()
    accion_display = serializers.CharField(source='get_accion_display', read_only=True)
    tabla_display = serializers.CharField(source='get_tabla_afectada_display', read_only=True)

    class Meta:
        model = RegistroAuditoria
        fields = (
            'id',
            'usuario',
            'usuario_detalle',
            'accion',
            'accion_display',
            'tabla_afectada',
            'tabla_display',
            'objeto_id',
            'detalles',
            'direccion_ip',
            'creado_en',
            'actualizado_en',
        )
        read_only_fields = fields

    def get_usuario_detalle(self, obj):
        if obj.usuario is None:
            return None
        return {
            'id': obj.usuario.pk,
            'nombre_usuario': obj.usuario.nombre_usuario,
            'nombre': obj.usuario.nombre,
            'apellido': obj.usuario.apellido,
            'rol': obj.usuario.rol,
        }