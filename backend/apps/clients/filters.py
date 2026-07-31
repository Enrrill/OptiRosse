import django_filters

from backend.apps.clients.models import ClienteOptica


class ClienteOpticaFilter(django_filters.FilterSet):
    activo = django_filters.BooleanFilter()

    class Meta:
        model = ClienteOptica
        fields = ('activo',)
