from django.db import models

from backend.apps.clients.models import ClienteOptica
from backend.apps.core.base_models import ActivoMixin, TimeStampedModel
from backend.apps.core.choices import EstadoPedido
from backend.apps.core.models import Usuario
from backend.apps.inventory.models import VarianteProducto


class RecetaOptica(ActivoMixin):
    nombre_paciente = models.CharField('nombre del paciente', max_length=100, blank=True, default='')

    od_esfera = models.DecimalField('OD esfera', max_digits=4, decimal_places=2, blank=True, null=True)
    od_cilindro = models.DecimalField('OD cilindro', max_digits=4, decimal_places=2, blank=True, null=True)
    od_eje = models.IntegerField('OD eje', blank=True, null=True)
    od_adicion = models.DecimalField('OD adición', max_digits=4, decimal_places=2, blank=True, null=True)

    oi_esfera = models.DecimalField('OI esfera', max_digits=4, decimal_places=2, blank=True, null=True)
    oi_cilindro = models.DecimalField('OI cilindro', max_digits=4, decimal_places=2, blank=True, null=True)
    oi_eje = models.IntegerField('OI eje', blank=True, null=True)
    oi_adicion = models.DecimalField('OI adición', max_digits=4, decimal_places=2, blank=True, null=True)

    distancia_pupilar = models.DecimalField('distancia pupilar', max_digits=4, decimal_places=1, blank=True, null=True)
    notas = models.TextField('notas', blank=True, default='')

    class Meta:
        verbose_name = 'receta óptica'
        verbose_name_plural = 'recetas ópticas'
        db_table = 'recetas_opticas'

    def __str__(self):
        return f'Receta #{self.id} - {self.nombre_paciente or "Sin paciente"}'


class Pedido(TimeStampedModel):
    numero_pedido = models.CharField('número de pedido', max_length=20, unique=True)
    cliente = models.ForeignKey(ClienteOptica, on_delete=models.RESTRICT, verbose_name='cliente')
    usuario = models.ForeignKey(Usuario, on_delete=models.RESTRICT, verbose_name='usuario')
    receta = models.OneToOneField(RecetaOptica, on_delete=models.SET_NULL, null=True, blank=True, verbose_name='receta')

    estado = models.CharField('estado', max_length=20, choices=EstadoPedido.choices, default=EstadoPedido.BORRADOR)
    subtotal = models.DecimalField('subtotal', max_digits=12, decimal_places=2, default=0.00)
    impuesto = models.DecimalField('impuesto', max_digits=12, decimal_places=2, default=0.00)
    total = models.DecimalField('total', max_digits=12, decimal_places=2, default=0.00)

    notas = models.TextField('notas', blank=True, default='')

    class Meta:
        verbose_name = 'pedido'
        verbose_name_plural = 'pedidos'
        db_table = 'pedidos'
        indexes = [
            models.Index(fields=['estado'], name='pedidos_idx_estado'),
        ]

    def __str__(self):
        return f'Pedido #{self.numero_pedido} - {self.cliente.nombre_comercial}'


class DetallePedido(models.Model):
    pedido = models.ForeignKey(Pedido, on_delete=models.CASCADE, related_name='detalles', verbose_name='pedido')
    variante = models.ForeignKey(VarianteProducto, on_delete=models.RESTRICT, verbose_name='variante')
    cantidad = models.IntegerField('cantidad', default=1)
    precio_unitario = models.DecimalField('precio unitario', max_digits=12, decimal_places=2)
    precio_total = models.DecimalField('precio total', max_digits=12, decimal_places=2)

    class Meta:
        verbose_name = 'detalle de pedido'
        verbose_name_plural = 'detalles de pedido'
        db_table = 'detalles_pedido'
        constraints = [
            models.CheckConstraint(condition=models.Q(cantidad__gte=1), name='detalles_cantidad_positiva'),
        ]

    def __str__(self):
        return f'{self.variante} x{self.cantidad}'


class ContadorPedido(models.Model):
    ultimo_numero = models.IntegerField('último número', default=0)

    class Meta:
        verbose_name = 'contador de pedidos'
        verbose_name_plural = 'contador de pedidos'
        db_table = 'contador_pedidos'

    def __str__(self):
        return f'Último número de pedido: {self.ultimo_numero}'
