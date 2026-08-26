from django.db import models
from django.db.models import Q
from django.contrib.postgres.search import SearchVector, SearchVectorField
from django.contrib.postgres.indexes import GinIndex

from backend.apps.core.base_models import ActivoMixin, TimeStampedModel
from backend.apps.core.choices import TipoProducto
from backend.common.utils import SanitizedModelMixin


class Categoria(SanitizedModelMixin, ActivoMixin):
    nombre = models.CharField('nombre', max_length=100)
    tipo_producto = models.CharField('tipo de producto', max_length=20, choices=TipoProducto.choices)

    class Meta:
        verbose_name = 'categoría'
        verbose_name_plural = 'categorías'
        db_table = 'categorias'
        constraints = [
            models.UniqueConstraint(
                fields=['tipo_producto', 'nombre'],
                name='categorias_unicas_tipo_nombre',
            )
        ]

    def __str__(self):
        return f'{self.nombre} ({self.get_tipo_producto_display()})'


class Producto(SanitizedModelMixin, TimeStampedModel, ActivoMixin):
    categoria = models.ForeignKey(Categoria, on_delete=models.RESTRICT, verbose_name='categoría')
    marca = models.CharField('marca', max_length=100)
    codigo_modelo = models.CharField('código del modelo', max_length=100)
    descripcion = models.TextField('descripción', blank=True, default='')

    indice_refraccion = models.CharField('índice de refracción', max_length=10, blank=True, default='')
    material = models.CharField('material', max_length=50, blank=True, default='')
    tratamiento = models.CharField('tratamiento', max_length=50, blank=True, default='')
    diseno = models.CharField('diseño', max_length=50, blank=True, default='')

    search_vector = SearchVectorField(null=True, editable=False)

    class Meta:
        verbose_name = 'producto'
        verbose_name_plural = 'productos'
        db_table = 'productos'
        indexes = [
            models.Index(fields=['search_vector'], name='idx_prod_search_vec'),
            GinIndex(fields=['search_vector'], name='idx_prod_search_gin'),
        ]

    def __str__(self):
        return f'{self.marca} {self.codigo_modelo}'

    def save(self, *args, **kwargs):
        self.sanitize_fields()
        is_new = self.pk is None
        if is_new:
            super().save(*args, **kwargs)
            Producto.objects.filter(pk=self.pk).update(
                search_vector=SearchVector('marca', 'codigo_modelo', 'descripcion')
            )
        else:
            self.search_vector = SearchVector('marca', 'codigo_modelo', 'descripcion')
            update_fields = kwargs.get('update_fields')
            if update_fields is not None:
                kwargs['update_fields'] = set(update_fields) | {'search_vector'}
            super().save(*args, **kwargs)



class VarianteProducto(SanitizedModelMixin, ActivoMixin):
    producto = models.ForeignKey(Producto, on_delete=models.CASCADE, related_name='variantes', verbose_name='producto')
    sku = models.CharField('SKU', max_length=100, unique=True)
    codigo_barras = models.CharField('código de barras', max_length=100, unique=True, blank=True, null=True)

    color = models.CharField('color', max_length=50, blank=True, default='')
    tamano = models.CharField('tamaño', max_length=50, blank=True, default='')

    esfera = models.DecimalField('esfera', max_digits=4, decimal_places=2, blank=True, null=True)
    cilindro = models.DecimalField('cilindro', max_digits=4, decimal_places=2, blank=True, null=True)
    eje = models.IntegerField('eje', blank=True, null=True)
    adicion = models.DecimalField('adición', max_digits=4, decimal_places=2, blank=True, null=True)

    stock = models.IntegerField('stock', default=0)
    alerta_stock_minimo = models.IntegerField('alerta stock mínimo', default=5)
    precio_al_mayor = models.DecimalField('precio al mayor', max_digits=12, decimal_places=2)
    precio_costo = models.DecimalField('precio de costo', max_digits=12, decimal_places=2)

    class Meta:
        verbose_name = 'variante de producto'
        verbose_name_plural = 'variantes de producto'
        db_table = 'variantes_producto'
        constraints = [
            models.CheckConstraint(condition=Q(stock__gte=0), name='variantes_stock_no_negativo'),
            models.CheckConstraint(
                condition=Q(alerta_stock_minimo__gte=0), name='variantes_alerta_stock_minimo_no_negativa'
            ),
            models.CheckConstraint(
                condition=Q(precio_al_mayor__gte=0), name='variantes_precio_mayor_no_negativo'
            ),
            models.CheckConstraint(condition=Q(precio_costo__gte=0), name='variantes_precio_costo_no_negativo'),
        ]

    def __str__(self):
        return f'{self.producto} - {self.sku}'
