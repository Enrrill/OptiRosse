from django.db import models


class RolUsuario(models.TextChoices):
    ADMINISTRADOR = 'administrador', 'Administrador'
    EMPLEADO = 'empleado', 'Empleado'


class TipoProducto(models.TextChoices):
    MONTURA = 'montura', 'Montura'
    CRISTAL_TERMINADO = 'cristal_terminado', 'Cristal Terminado'
    BLOQUE_TALLADO = 'bloque_tallado', 'Bloque Tallado'
    ACCESORIO = 'accesorio', 'Accesorio'


class EstadoPedido(models.TextChoices):
    BORRADOR = 'borrador', 'Borrador'
    CONFIRMADO = 'confirmado', 'Confirmado'
    EN_LABORATORIO = 'en_laboratorio', 'En Laboratorio'
    LISTO_PARA_ENTREGA = 'listo_para_entrega', 'Listo para Entrega'
    ENTREGADO = 'entregado', 'Entregado'
    CANCELADO = 'cancelado', 'Cancelado'


class TipoPedido(models.TextChoices):
    LABORATORIO = 'laboratorio', 'Con Laboratorio'
    MOSTRADOR = 'mostrador', 'Venta de Mostrador'


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


class CategoriaDocumentoEmpresa(models.TextChoices):
    INSTITUCIONAL = 'institucional', 'Institucional / Legal'
    RECURSOS_HUMANOS = 'recursos_humanos', 'Recursos Humanos'
    FINANCIERO = 'financiero', 'Financiero / Contable'
    OPERATIVO = 'operativo', 'Operativo / Taller'
    OTRO = 'otro', 'Otro'


class AccionAuditoria(models.TextChoices):
    CREAR = 'crear', 'Crear'
    ACTUALIZAR = 'actualizar', 'Actualizar'
    ELIMINAR = 'eliminar', 'Eliminar'
    DESACTIVAR = 'desactivar', 'Desactivar'
    AJUSTE_STOCK = 'ajuste_stock', 'Ajuste de stock'
    CONFIRMAR_PEDIDO = 'confirmar_pedido', 'Confirmar pedido'
    CAMBIAR_ESTADO = 'cambiar_estado', 'Cambiar estado'
    CANCELAR_PEDIDO = 'cancelar_pedido', 'Cancelar pedido'
    ELIMINAR_PEDIDO = 'eliminar_pedido', 'Eliminar pedido'
    APROBAR_PAGO = 'aprobar_pago', 'Aprobar pago'
    RECHAZAR_PAGO = 'rechazar_pago', 'Rechazar pago'
    ASIENTO_LIBRO_MAYOR = 'asiento_libro_mayor', 'Asiento de libro mayor'
    GENERAR_DOCUMENTO = 'generar_documento', 'Generar documento'


class TablaAfectada(models.TextChoices):
    USUARIOS = 'usuarios', 'Usuarios'
    CLIENTES = 'clientes_optica', 'Clientes'
    PACIENTES = 'pacientes', 'Pacientes'
    CATEGORIAS = 'categorias', 'Categorías'
    PRODUCTOS = 'productos', 'Productos'
    VARIANTES = 'variantes_producto', 'Variantes'
    RECETAS = 'recetas_opticas', 'Recetas ópticas'
    PEDIDOS = 'pedidos', 'Pedidos'
    DETALLES_PEDIDO = 'detalles_pedido', 'Detalles de pedido'
    CONTADOR_PEDIDOS = 'contador_pedidos', 'Contador de pedidos'
    METODOS_PAGO = 'metodos_pago', 'Métodos de pago'
    PAGOS = 'pagos', 'Pagos'
    LIBRO_MAYOR = 'libro_mayor', 'Libro mayor'
    PLANTILLAS_DOCUMENTOS = 'plantillas_documentos', 'Plantillas de documentos'
    DOCUMENTOS_EMPRESA = 'documentos_empresa', 'Documentos de empresa'
    REGISTROS_AUDITORIA = 'registros_auditoria', 'Registros de auditoría'

