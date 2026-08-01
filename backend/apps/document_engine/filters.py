import django_filters

from backend.apps.core.choices import TipoDocumento
from backend.apps.document_engine.models import PlantillaDocumento


class PlantillaDocumentoFilter(django_filters.FilterSet):
    activo = django_filters.BooleanFilter()
    tipo_documento = django_filters.ChoiceFilter(choices=TipoDocumento.choices)

    class Meta:
        model = PlantillaDocumento
        fields = ('activo', 'tipo_documento')
