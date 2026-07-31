from django.urls import path

from rest_framework.routers import SimpleRouter

from backend.apps.core.views.auth import (
    CambiarContrasenaView,
    LoginView,
    LogoutView,
    MeView,
    RefreshView,
)
from backend.apps.core.views.usuarios import UsuarioViewSet

app_name = 'core'

router = SimpleRouter()
router.register('usuarios', UsuarioViewSet, basename='usuario')

urlpatterns = [
    path('auth/login/', LoginView.as_view(), name='auth-login'),
    path('auth/refresh/', RefreshView.as_view(), name='auth-refresh'),
    path('auth/logout/', LogoutView.as_view(), name='auth-logout'),
    path('auth/me/', MeView.as_view(), name='auth-me'),
    path('auth/cambiar-contrasena/', CambiarContrasenaView.as_view(), name='auth-cambiar-contrasena'),
]

urlpatterns += router.urls
