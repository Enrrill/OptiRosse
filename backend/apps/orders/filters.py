import django_filters

from backend.apps.clients.models import ClienteOptica
from backend.apps.core.choices import EstadoPedido, TipoPedido
from backend.apps.core.models import Usuario
from backend.apps.orders.models import Pedido, RecetaOptica
from backend.apps.pacientes.models import Paciente


class RecetaOpticaFilter(django_filters.FilterSet):
    activo = django_filters.BooleanFilter()
    paciente = django_filters.ModelChoiceFilter(queryset=Paciente.objects.all())

    class Meta:
        model = RecetaOptica
        fields = ('activo', 'paciente')


class PedidoFilter(django_filters.FilterSet):
    estado = django_filters.ChoiceFilter(choices=EstadoPedido.choices)
    tipo_pedido = django_filters.ChoiceFilter(choices=TipoPedido.choices)
    cliente = django_filters.ModelChoiceFilter(queryset=ClienteOptica.objects.all())
    paciente = django_filters.ModelChoiceFilter(queryset=Paciente.objects.all())
    usuario = django_filters.ModelChoiceFilter(queryset=Usuario.objects.all())
    numero_pedido = django_filters.CharFilter(lookup_expr='icontains')
    fecha_creado = django_filters.DateFromToRangeFilter(field_name='creado_en')

    class Meta:
        model = Pedido
        fields = ('estado', 'tipo_pedido', 'cliente', 'paciente', 'usuario', 'numero_pedido', 'fecha_creado')
