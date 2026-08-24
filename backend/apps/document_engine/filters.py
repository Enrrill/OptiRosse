import django_filters

from backend.apps.core.choices import CategoriaDocumentoEmpresa, TipoDocumento
from backend.apps.document_engine.models import DocumentoEmpresa, PlantillaDocumento


class PlantillaDocumentoFilter(django_filters.FilterSet):
    activo = django_filters.BooleanFilter()
    tipo_documento = django_filters.ChoiceFilter(choices=TipoDocumento.choices)

    class Meta:
        model = PlantillaDocumento
        fields = ('activo', 'tipo_documento')


class DocumentoEmpresaFilter(django_filters.FilterSet):
    activo = django_filters.BooleanFilter()
    categoria = django_filters.ChoiceFilter(choices=CategoriaDocumentoEmpresa.choices)
    extension = django_filters.CharFilter(lookup_expr='iexact')
    es_plantilla_generable = django_filters.BooleanFilter()

    class Meta:
        model = DocumentoEmpresa
        fields = ('activo', 'categoria', 'extension', 'es_plantilla_generable')

