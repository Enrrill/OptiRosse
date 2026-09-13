import django_filters

from backend.apps.clients.models import ClienteOptica
from backend.apps.pacientes.models import Paciente


class PacienteFilter(django_filters.FilterSet):
    activo = django_filters.BooleanFilter()
    cliente_optica = django_filters.ModelChoiceFilter(queryset=ClienteOptica.objects.all())
    cedula = django_filters.CharFilter(lookup_expr='icontains')
    nombre = django_filters.CharFilter(lookup_expr='icontains')
    apellido = django_filters.CharFilter(lookup_expr='icontains')

    class Meta:
        model = Paciente
        fields = ('activo', 'cliente_optica', 'cedula', 'nombre', 'apellido')
