from django.db import models


class TimeStampedModel(models.Model):
    creado_en = models.DateTimeField(auto_now_add=True)
    actualizado_en = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class ActivoMixin(models.Model):
    activo = models.BooleanField(default=True)

    class Meta:
        abstract = True
