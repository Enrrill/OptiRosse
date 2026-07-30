from django.contrib import admin

from backend.apps.document_engine.models import PlantillaDocumento


@admin.register(PlantillaDocumento)
class PlantillaDocumentoAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'tipo_documento', 'activo', 'actualizado_en')
    list_filter = ('tipo_documento', 'activo')
    search_fields = ('nombre',)
