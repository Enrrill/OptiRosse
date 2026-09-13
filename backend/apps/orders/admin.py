from django.contrib import admin

from backend.apps.orders.models import ContadorPedido, DetallePedido, Pedido, RecetaOptica


class DetallePedidoInline(admin.TabularInline):
    model = DetallePedido
    extra = 1


@admin.register(RecetaOptica)
class RecetaOpticaAdmin(admin.ModelAdmin):
    list_display = ('id', 'paciente', 'medico_prescriptor', 'activo', 'creado_en')
    list_filter = ('activo',)
    search_fields = ('paciente__nombre', 'paciente__apellido', 'paciente__cedula', 'medico_prescriptor')


@admin.register(Pedido)
class PedidoAdmin(admin.ModelAdmin):
    list_display = ('numero_pedido', 'cliente', 'paciente', 'tipo_pedido', 'estado', 'total', 'creado_en')
    list_filter = ('estado', 'tipo_pedido')
    search_fields = ('numero_pedido', 'cliente__nombre_comercial', 'paciente__nombre', 'paciente__apellido')
    inlines = [DetallePedidoInline]


@admin.register(DetallePedido)
class DetallePedidoAdmin(admin.ModelAdmin):
    list_display = ('pedido', 'variante', 'cantidad', 'precio_unitario', 'precio_total')


@admin.register(ContadorPedido)
class ContadorPedidoAdmin(admin.ModelAdmin):
    list_display = ('id', 'ultimo_numero')
