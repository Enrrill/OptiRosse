from django.db import models

from backend.apps.core.base_models import ActivoMixin
from backend.apps.core.choices import TipoDocumento


class PlantillaDocumento(ActivoMixin):
    nombre = models.CharField('nombre', max_length=100)
    tipo_documento = models.CharField('tipo de documento', max_length=20, choices=TipoDocumento.choices, unique=True)
    contenido_html = models.TextField('contenido HTML')
    estilos_css = models.TextField('estilos CSS', blank=True, default='')
    actualizado_en = models.DateTimeField('actualizado en', auto_now=True)

    class Meta:
        verbose_name = 'plantilla de documento'
        verbose_name_plural = 'plantillas de documentos'
        db_table = 'plantillas_documentos'

    def __str__(self):
        return f'{self.nombre} ({self.get_tipo_documento_display()})'
