from django.contrib.auth import authenticate, get_user_model
from django.contrib.auth.models import update_last_login
from django.db.models import Q

from rest_framework import serializers
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer as SimpleTokenObtainPairSerializer
from rest_framework_simplejwt.settings import api_settings


class TokenObtainPairSerializer(SimpleTokenObtainPairSerializer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields.pop(self.username_field, None)
        self.fields['identificador'] = serializers.CharField(write_only=True)

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['rol'] = user.rol
        nombre_completo = ' '.join(filter(None, [user.nombre, user.apellido]))
        token['nombre'] = nombre_completo or user.nombre_usuario
        return token

    def validate(self, attrs):
        identificador = attrs['identificador']
        user_model = get_user_model()
        try:
            usuario = user_model.objects.get(
                Q(nombre_usuario__iexact=identificador) | Q(correo__iexact=identificador)
            )
        except (user_model.DoesNotExist, user_model.MultipleObjectsReturned):
            usuario = None

        if usuario is None:
            raise AuthenticationFailed('No existe una cuenta activa con estas credenciales')

        self.user = authenticate(
            request=self.context.get('request'),
            username=usuario.nombre_usuario,
            password=attrs['password'],
        )

        if not api_settings.USER_AUTHENTICATION_RULE(self.user):
            raise AuthenticationFailed('No existe una cuenta activa con estas credenciales')

        refresh = self.get_token(self.user)
        data = {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }

        if api_settings.UPDATE_LAST_LOGIN:
            update_last_login(None, self.user)

        return data
