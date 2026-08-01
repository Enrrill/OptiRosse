import django_filters

from backend.apps.clients.models import ClienteOptica
from backend.apps.core.choices import EstadoPago, TipoAsiento
from backend.apps.finance.models import LibroMayor, MetodoPago, Pago
from backend.apps.orders.models import Pedido


class MetodoPagoFilter(django_filters.FilterSet):
    activo = django_filters.BooleanFilter()

    class Meta:
        model = MetodoPago
        fields = ('activo', 'moneda')


class PagoFilter(django_filters.FilterSet):
    estado = django_filters.ChoiceFilter(choices=EstadoPago.choices)
    cliente = django_filters.ModelChoiceFilter(queryset=ClienteOptica.objects.all())
    pedido = django_filters.ModelChoiceFilter(queryset=Pedido.objects.all())
    metodo_pago = django_filters.ModelChoiceFilter(queryset=MetodoPago.objects.all())
    fecha_pago = django_filters.DateFromToRangeFilter()

    class Meta:
        model = Pago
        fields = ('estado', 'cliente', 'pedido', 'metodo_pago', 'fecha_pago')


class LibroMayorFilter(django_filters.FilterSet):
    cliente = django_filters.ModelChoiceFilter(queryset=ClienteOptica.objects.all())
    tipo_asiento = django_filters.ChoiceFilter(choices=TipoAsiento.choices)
    fecha_creado = django_filters.DateFromToRangeFilter()

    class Meta:
        model = LibroMayor
        fields = ('cliente', 'tipo_asiento', 'fecha_creado')
