from django.contrib import admin

from backend.apps.clients.models import ClienteOptica


@admin.register(ClienteOptica)
class ClienteOpticaAdmin(admin.ModelAdmin):
    list_display = ('nombre_comercial', 'razon_social', 'identificacion_fiscal', 'activo', 'creado_en')
    list_filter = ('activo',)
    search_fields = ('nombre_comercial', 'razon_social', 'identificacion_fiscal')
