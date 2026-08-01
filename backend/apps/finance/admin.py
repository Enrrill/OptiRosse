from django.contrib import admin

from backend.apps.finance.models import LibroMayor, MetodoPago, Pago


@admin.register(MetodoPago)
class MetodoPagoAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'moneda', 'requiere_referencia', 'activo')


@admin.register(Pago)
class PagoAdmin(admin.ModelAdmin):
    list_display = ('id', 'cliente', 'monto', 'estado', 'fecha_pago', 'motivo_rechazo', 'creado_en')
    list_filter = ('estado', 'metodo_pago')
    search_fields = ('cliente__nombre_comercial', 'numero_referencia')


@admin.register(LibroMayor)
class LibroMayorAdmin(admin.ModelAdmin):
    list_display = ('cliente', 'tipo_asiento', 'monto', 'saldo_posterior', 'creado_en')
    list_filter = ('tipo_asiento',)
    search_fields = ('cliente__nombre_comercial', 'descripcion')
