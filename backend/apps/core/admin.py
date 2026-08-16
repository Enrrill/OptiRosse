from django.contrib import admin

from backend.apps.core.models import RegistroAuditoria, Usuario


@admin.register(Usuario)
class UsuarioAdmin(admin.ModelAdmin):
    list_display = ('nombre_usuario', 'correo', 'rol', 'activo', 'creado_en')
    list_filter = ('rol', 'activo')
    search_fields = ('nombre_usuario', 'correo', 'nombre', 'apellido')


@admin.register(RegistroAuditoria)
class RegistroAuditoriaAdmin(admin.ModelAdmin):
    list_display = ('creado_en', 'accion', 'tabla_afectada', 'usuario', 'objeto_id')
    list_filter = ('accion', 'tabla_afectada', 'usuario')
    search_fields = ('accion', 'tabla_afectada', 'usuario__nombre_usuario', 'usuario__correo')
    ordering = ('-creado_en',)
