from django.db import models

from backend.apps.core.base_models import ActivoMixin, TimeStampedModel
from backend.common.utils import SanitizedModelMixin


class ClienteOptica(SanitizedModelMixin, TimeStampedModel, ActivoMixin):
    razon_social = models.CharField('razón social', max_length=150)
    nombre_comercial = models.CharField('nombre comercial', max_length=150)
    identificacion_fiscal = models.CharField('identificación fiscal', max_length=30, unique=True)
    correo = models.EmailField('correo electrónico', max_length=254)
    telefono = models.CharField('teléfono', max_length=30)
    direccion = models.TextField('dirección')
    limite_credito = models.DecimalField('límite de crédito', max_digits=12, decimal_places=2, default=0.00)
    dias_credito = models.IntegerField('días de crédito', default=0)

    class Meta:
        verbose_name = 'cliente óptica'
        verbose_name_plural = 'clientes ópticas'
        db_table = 'clientes_optica'

    def __str__(self):
        return f'{self.nombre_comercial} ({self.identificacion_fiscal})'
