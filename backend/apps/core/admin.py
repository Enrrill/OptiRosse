from django.contrib import admin

from backend.apps.core.models import RegistroAuditoria, Usuario


@admin.register(Usuario)
class UsuarioAdmin(admin.ModelAdmin):
    list_display = ('nombre_usuario', 'correo', 'rol', 'activo', 'creado_en')
    list_filter = ('rol', 'activo')
    search_fields = ('nombre_usuario', 'correo', 'nombre', 'apellido')


@admin.register(RegistroAuditoria)
class RegistroAuditoriaAdmin(admin.ModelAdmin):
    list_display = ('accion', 'tabla_afectada', 'usuario', 'creado_en')
    list_filter = ('accion', 'tabla_afectada')
    search_fields = ('accion', 'tabla_afectada')
