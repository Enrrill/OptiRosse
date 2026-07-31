from rest_framework.permissions import AllowAny
from rest_framework.views import APIView

from backend.apps.core.services import AuthService
from backend.common.api.response import api_response


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        tokens = AuthService.login(request.data, request)
        return api_response(tokens, message='Sesión iniciada correctamente')


class RefreshView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        tokens = AuthService.refresh(request.data)
        return api_response(tokens, message='Sesión renovada')


class LogoutView(APIView):
    def post(self, request):
        AuthService.logout(request.data.get('refresh', ''))
        return api_response(message='Sesión cerrada')


class MeView(APIView):
    def get(self, request):
        return api_response(AuthService.me(request.user))


class CambiarContrasenaView(APIView):
    def post(self, request):
        AuthService.cambiar_contrasena(
            request.user,
            request.data.get('contrasena_actual', ''),
            request.data.get('contrasena_nueva', ''),
        )
        return api_response(message='Contraseña actualizada correctamente')
