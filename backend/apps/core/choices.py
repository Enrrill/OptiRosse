from django.db import models


class RolUsuario(models.TextChoices):
    ADMINISTRADOR = 'administrador', 'Administrador'
    VENDEDOR_B2B = 'vendedor_b2b', 'Vendedor B2B'
    ALMACEN = 'almacen', 'Almacén'
    TECNICO_TALLER = 'tecnico_taller', 'Técnico de Taller'
    CONTABILIDAD = 'contabilidad', 'Contabilidad'


class TipoProducto(models.TextChoices):
    MONTURA = 'montura', 'Montura'
    CRISTAL_TERMINADO = 'cristal_terminado', 'Cristal Terminado'
    BLOQUE_TALLADO = 'bloque_tallado', 'Bloque Tallado'
    ACCESORIO = 'accesorio', 'Accesorio'


class EstadoPedido(models.TextChoices):
    BORRADOR = 'borrador', 'Borrador'
    CONFIRMADO = 'confirmado', 'Confirmado'
    EN_TALLER = 'en_taller', 'En Taller'
    LISTO_PARA_DESPACHO = 'listo_para_despacho', 'Listo para Despacho'
    ENVIADO = 'enviado', 'Enviado'
    CANCELADO = 'cancelado', 'Cancelado'


class EstadoPago(models.TextChoices):
    PENDIENTE = 'pendiente', 'Pendiente'
    APROBADO = 'aprobado', 'Aprobado'
    RECHAZADO = 'rechazado', 'Rechazado'


class TipoAsiento(models.TextChoices):
    DEBITO = 'debito', 'Débito'
    CREDITO = 'credito', 'Crédito'


class TipoDocumento(models.TextChoices):
    FACTURA = 'factura', 'Factura'
    ORDEN_TRABAJO = 'orden_trabajo', 'Orden de Trabajo'
    NOTA_ENTREGA = 'nota_entrega', 'Nota de Entrega'
    RECIBO_PAGO = 'recibo_pago', 'Recibo de Pago'
