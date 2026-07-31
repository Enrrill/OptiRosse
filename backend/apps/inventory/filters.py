import django_filters
from django.db.models import F

from backend.apps.core.choices import TipoProducto
from backend.apps.inventory.models import Categoria, Producto, VarianteProducto


class CategoriaFilter(django_filters.FilterSet):
    activo = django_filters.BooleanFilter()

    class Meta:
        model = Categoria
        fields = ('activo',)


class ProductoFilter(django_filters.FilterSet):
    activo = django_filters.BooleanFilter()
    categoria = django_filters.ModelChoiceFilter(queryset=Categoria.objects.all())
    tipo = django_filters.ChoiceFilter(field_name='categoria__tipo_producto', choices=TipoProducto.choices)
    marca = django_filters.CharFilter(lookup_expr='icontains')

    class Meta:
        model = Producto
        fields = ('activo', 'categoria', 'tipo', 'marca')


class VarianteProductoFilter(django_filters.FilterSet):
    activo = django_filters.BooleanFilter()
    producto = django_filters.ModelChoiceFilter(queryset=Producto.objects.all())
    producto__categoria = django_filters.ModelChoiceFilter(
        field_name='producto__categoria', queryset=Categoria.objects.all()
    )
    stock_bajo = django_filters.BooleanFilter(method='filtrar_stock_bajo')

    def filtrar_stock_bajo(self, queryset, name, value):
        if value:
            return queryset.filter(stock__lte=F('alerta_stock_minimo'))
        return queryset

    class Meta:
        model = VarianteProducto
        fields = ('activo', 'producto', 'producto__categoria', 'stock_bajo')
