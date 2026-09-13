from django.contrib import admin

from backend.apps.pacientes.models import Paciente


@admin.register(Paciente)
class PacienteAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'apellido', 'cedula', 'telefono', 'correo', 'activo', 'creado_en')
    list_filter = ('activo',)
    search_fields = ('nombre', 'apellido', 'cedula', 'correo', 'telefono')
