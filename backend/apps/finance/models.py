from django.db import models

from backend.apps.clients.models import ClienteOptica
from backend.apps.core.base_models import TimeStampedModel
from backend.apps.core.choices import EstadoPago, TipoAsiento
from backend.apps.orders.models import Pedido


class MetodoPago(models.Model):
    nombre = models.CharField('nombre', max_length=50)
    moneda = models.CharField('moneda', max_length=10, default='USD')
    requiere_referencia = models.BooleanField('requiere referencia', default=True)

    class Meta:
        verbose_name = 'método de pago'
        verbose_name_plural = 'métodos de pago'
        db_table = 'metodos_pago'

    def __str__(self):
        return f'{self.nombre} ({self.moneda})'


class Pago(TimeStampedModel):
    cliente = models.ForeignKey(ClienteOptica, on_delete=models.RESTRICT, verbose_name='cliente')
    pedido = models.ForeignKey(Pedido, on_delete=models.SET_NULL, null=True, blank=True, verbose_name='pedido')
    metodo_pago = models.ForeignKey(MetodoPago, on_delete=models.RESTRICT, verbose_name='método de pago')

    monto = models.DecimalField('monto', max_digits=12, decimal_places=2)
    tasa_cambio = models.DecimalField('tasa de cambio', max_digits=10, decimal_places=4, default=1.0000)
    numero_referencia = models.CharField('número de referencia', max_length=100, blank=True, default='')
    comprobante_imagen_url = models.CharField('URL comprobante', max_length=255, blank=True, default='')

    estado = models.CharField('estado', max_length=20, choices=EstadoPago.choices, default=EstadoPago.PENDIENTE)
    fecha_pago = models.DateTimeField('fecha de pago')

    class Meta:
        verbose_name = 'pago'
        verbose_name_plural = 'pagos'
        db_table = 'pagos'

    def __str__(self):
        return f'Pago #{self.id} - {self.cliente.nombre_comercial} ({self.get_estado_display()})'


class LibroMayor(TimeStampedModel):
    cliente = models.ForeignKey(ClienteOptica, on_delete=models.RESTRICT, verbose_name='cliente')
    pedido = models.ForeignKey(Pedido, on_delete=models.SET_NULL, null=True, blank=True, verbose_name='pedido')
    pago = models.ForeignKey(Pago, on_delete=models.SET_NULL, null=True, blank=True, verbose_name='pago')

    tipo_asiento = models.CharField('tipo de asiento', max_length=10, choices=TipoAsiento.choices)
    monto = models.DecimalField('monto', max_digits=12, decimal_places=2)
    saldo_posterior = models.DecimalField('saldo posterior', max_digits=12, decimal_places=2)
    descripcion = models.CharField('descripción', max_length=255)

    class Meta:
        verbose_name = 'libro mayor'
        verbose_name_plural = 'libro mayor'
        db_table = 'libro_mayor'

    def __str__(self):
        return f'{self.get_tipo_asiento_display()} {self.monto} - {self.cliente.nombre_comercial}'
