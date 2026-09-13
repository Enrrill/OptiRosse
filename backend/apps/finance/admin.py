from django.contrib import admin

from backend.apps.finance.models import LibroMayor, MetodoPago, Pago


@admin.register(MetodoPago)
class MetodoPagoAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'moneda', 'requiere_referencia', 'activo')


@admin.register(Pago)
class PagoAdmin(admin.ModelAdmin):
    list_display = ('id', 'cliente', 'paciente', 'monto', 'estado', 'fecha_pago', 'motivo_rechazo', 'creado_en')
    list_filter = ('estado', 'metodo_pago')
    search_fields = ('cliente__nombre_comercial', 'paciente__nombre', 'paciente__apellido', 'numero_referencia')


@admin.register(LibroMayor)
class LibroMayorAdmin(admin.ModelAdmin):
    list_display = ('id', 'cliente', 'paciente', 'tipo_asiento', 'monto', 'saldo_posterior', 'creado_en')
    list_filter = ('tipo_asiento',)
    search_fields = ('cliente__nombre_comercial', 'paciente__nombre', 'paciente__apellido', 'descripcion')
