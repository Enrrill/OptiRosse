from django.contrib import admin

from backend.apps.orders.models import DetallePedido, Pedido, RecetaOptica


class DetallePedidoInline(admin.TabularInline):
    model = DetallePedido
    extra = 1


@admin.register(RecetaOptica)
class RecetaOpticaAdmin(admin.ModelAdmin):
    list_display = ('id', 'nombre_paciente')
    search_fields = ('nombre_paciente',)


@admin.register(Pedido)
class PedidoAdmin(admin.ModelAdmin):
    list_display = ('numero_pedido', 'cliente', 'estado', 'total', 'creado_en')
    list_filter = ('estado',)
    search_fields = ('numero_pedido', 'cliente__nombre_comercial')
    inlines = [DetallePedidoInline]


@admin.register(DetallePedido)
class DetallePedidoAdmin(admin.ModelAdmin):
    list_display = ('pedido', 'variante', 'cantidad', 'precio_unitario', 'precio_total')
