from django.contrib.auth.password_validation import validate_password

from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.serializers import TokenRefreshSerializer
from rest_framework_simplejwt.token_blacklist.models import OutstandingToken, BlacklistedToken
from rest_framework_simplejwt.tokens import RefreshToken

from backend.apps.core.models import RegistroAuditoria, Usuario
from backend.apps.core.serializers.usuario import UsuarioSerializer
from backend.common.api.exceptions import ApiError
from backend.common.api.tokens import TokenObtainPairSerializer


class AuthService:
    @staticmethod
    def login(datos, request):
        serializer = TokenObtainPairSerializer(data=datos, context={'request': request})
        serializer.is_valid(raise_exception=True)
        return serializer.validated_data

    @staticmethod
    def refresh(datos):
        serializer = TokenRefreshSerializer(data=datos)
        try:
            serializer.is_valid(raise_exception=True)
        except TokenError:
            raise ApiError(
                'El token de refresco es inválido o ya expiró',
                status_code=401,
                code='token_invalido',
            )
        return serializer.validated_data

    @staticmethod
    def logout(refresh):
        try:
            RefreshToken(refresh).blacklist()
        except TokenError:
            raise ApiError(
                'El token de refresco es inválido o ya expiró',
                status_code=400,
                code='token_invalido',
            )

    @staticmethod
    def cambiar_contrasena(usuario, contrasena_actual, contrasena_nueva):
        if not usuario.check_password(contrasena_actual):
            raise ApiError(
                'La contraseña actual es incorrecta',
                status_code=400,
                code='contrasena_incorrecta',
            )
        validate_password(contrasena_nueva, user=usuario)
        usuario.set_password(contrasena_nueva)
        usuario.save(update_fields=['password', 'actualizado_en'])
        for token in OutstandingToken.objects.filter(user=usuario):
            BlacklistedToken.objects.get_or_create(token=token)
        return usuario

    @staticmethod
    def me(usuario):
        return UsuarioSerializer(usuario).data


class AuditoriaService:
    @staticmethod
    def registrar(usuario=None, accion='', tabla_afectada='', objeto_id=None, detalles=None, direccion_ip=''):
        usuario = usuario if usuario is not None and usuario.is_authenticated else None
        RegistroAuditoria.objects.create(
            usuario=usuario,
            accion=accion,
            tabla_afectada=tabla_afectada,
            objeto_id=objeto_id,
            detalles=detalles,
            direccion_ip=direccion_ip,
        )
