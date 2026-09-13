from django.db import models

from backend.apps.core.base_models import ActivoMixin, TimeStampedModel
from backend.common.utils import SanitizedModelMixin


class Paciente(SanitizedModelMixin, TimeStampedModel, ActivoMixin):
    nombre = models.CharField('nombre', max_length=100)
    apellido = models.CharField('apellido', max_length=100, blank=True, default='')
    cedula = models.CharField('cédula', max_length=20, unique=True, null=True, blank=True)
    telefono = models.CharField('teléfono', max_length=30, blank=True, default='')
    correo = models.EmailField('correo', blank=True, default='')
    fecha_nacimiento = models.DateField('fecha de nacimiento', null=True, blank=True)
    notas = models.TextField('notas', blank=True, default='')

    cliente_optica = models.ForeignKey(
        'clients.ClienteOptica',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='pacientes',
        verbose_name='cliente óptica asociado',
    )

    class Meta:
        verbose_name = 'paciente'
        verbose_name_plural = 'pacientes'
        db_table = 'pacientes'
        indexes = [
            models.Index(fields=['cedula'], name='pacientes_idx_cedula'),
        ]

    def __str__(self):
        if self.apellido:
            return f'{self.nombre} {self.apellido}'
        return self.nombre
