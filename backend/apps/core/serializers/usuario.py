from django.contrib.auth.password_validation import validate_password

from rest_framework import serializers
from rest_framework.validators import UniqueValidator

from backend.apps.core.models import Usuario


class UsuarioSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        required=False,
        allow_blank=False,
        style={'input_type': 'password'},
    )

    class Meta:
        model = Usuario
        fields = (
            'id',
            'nombre_usuario',
            'correo',
            'nombre',
            'apellido',
            'rol',
            'telefono',
            'activo',
            'password',
            'creado_en',
            'actualizado_en',
        )
        read_only_fields = ('id', 'creado_en', 'actualizado_en')
        extra_kwargs = {
            'nombre_usuario': {
                'validators': [
                    UniqueValidator(
                        queryset=Usuario.objects.all(),
                        message='Este nombre de usuario ya está en uso',
                    )
                ]
            },
            'correo': {
                'validators': [
                    UniqueValidator(
                        queryset=Usuario.objects.all(),
                        message='Este correo ya está registrado',
                    )
                ]
            },
        }

    def validate_password(self, value):
        validate_password(value)
        return value

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        if not password:
            raise serializers.ValidationError({'password': 'La contraseña es obligatoria'})
        usuario = Usuario(**validated_data)
        usuario.set_password(password)
        usuario.save()
        return usuario

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for campo, valor in validated_data.items():
            setattr(instance, campo, valor)
        if password:
            instance.set_password(password)
        instance.save()
        return instance
