import os

from django.conf import settings
from django.db import models

from backend.apps.core.base_models import ActivoMixin, TimeStampedModel
from backend.apps.core.choices import CategoriaDocumentoEmpresa, TipoDocumento


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


class DocumentoEmpresa(ActivoMixin, TimeStampedModel):
    nombre = models.CharField('nombre', max_length=150)
    descripcion = models.TextField('descripción', blank=True, default='')
    categoria = models.CharField(
        'categoría',
        max_length=30,
        choices=CategoriaDocumentoEmpresa.choices,
        default=CategoriaDocumentoEmpresa.INSTITUCIONAL,
    )
    archivo = models.FileField('archivo', upload_to='documentos_empresa/')
    extension = models.CharField('extensión', max_length=15, blank=True, default='')
    tamano_bytes = models.BigIntegerField('tamaño en bytes', default=0)
    version = models.CharField('versión', max_length=20, default='1.0')
    es_plantilla_generable = models.BooleanField('es plantilla generable', default=False)
    variables_schema = models.JSONField('esquema de variables', default=list, blank=True)
    creado_por = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        verbose_name='creado por',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='documentos_empresa_creados',
    )

    class Meta:
        verbose_name = 'documento de empresa'
        verbose_name_plural = 'documentos de empresa'
        db_table = 'documentos_empresa'
        ordering = ['-creado_en']

    def save(self, *args, **kwargs):
        if self.archivo:
            if hasattr(self.archivo, 'name') and self.archivo.name:
                ext = os.path.splitext(self.archivo.name)[1].lower().lstrip('.')
                if ext:
                    self.extension = ext
            try:
                if hasattr(self.archivo, 'size') and self.archivo.size:
                    self.tamano_bytes = self.archivo.size
            except (AttributeError, ValueError, OSError):
                pass
        super().save(*args, **kwargs)

    def __str__(self):
        return f'{self.nombre} (v{self.version})'

