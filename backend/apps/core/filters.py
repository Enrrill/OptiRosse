import django_filters

from backend.apps.core.choices import AccionAuditoria, RolUsuario, TablaAfectada
from backend.apps.core.models import RegistroAuditoria, Usuario


class UsuarioFilter(django_filters.FilterSet):
    activo = django_filters.BooleanFilter()
    rol = django_filters.ChoiceFilter(choices=RolUsuario.choices)

    class Meta:
        model = Usuario
        fields = ('activo', 'rol')


class RegistroAuditoriaFilter(django_filters.FilterSet):
    usuario = django_filters.ModelChoiceFilter(queryset=Usuario.objects.all())
    accion = django_filters.ChoiceFilter(choices=AccionAuditoria.choices)
    tabla = django_filters.ChoiceFilter(
        field_name='tabla_afectada',
        choices=TablaAfectada.choices,
    )
    objeto_id = django_filters.NumberFilter()
    fecha_creado = django_filters.DateFromToRangeFilter()

    class Meta:
        model = RegistroAuditoria
        fields = ('usuario', 'accion', 'tabla', 'objeto_id', 'fecha_creado')
