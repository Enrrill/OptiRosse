from django.contrib import admin

from backend.apps.inventory.models import Categoria, Producto, VarianteProducto


class VarianteProductoInline(admin.TabularInline):
    model = VarianteProducto
    extra = 1


@admin.register(Categoria)
class CategoriaAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'tipo_producto')
    list_filter = ('tipo_producto',)


@admin.register(Producto)
class ProductoAdmin(admin.ModelAdmin):
    list_display = ('marca', 'codigo_modelo', 'categoria', 'activo', 'creado_en')
    list_filter = ('categoria', 'activo')
    search_fields = ('marca', 'codigo_modelo')
    inlines = [VarianteProductoInline]


@admin.register(VarianteProducto)
class VarianteProductoAdmin(admin.ModelAdmin):
    list_display = ('sku', 'producto', 'stock', 'precio_al_mayor', 'precio_costo')
    list_filter = ('producto__categoria',)
    search_fields = ('sku', 'codigo_barras', 'producto__marca')
