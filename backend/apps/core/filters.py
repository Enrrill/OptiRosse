import django_filters

from backend.apps.core.choices import RolUsuario
from backend.apps.core.models import Usuario


class UsuarioFilter(django_filters.FilterSet):
    activo = django_filters.BooleanFilter()
    rol = django_filters.ChoiceFilter(choices=RolUsuario.choices)

    class Meta:
        model = Usuario
        fields = ('activo', 'rol')
