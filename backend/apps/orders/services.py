from decimal import ROUND_HALF_UP, Decimal

from django.conf import settings
from django.db import transaction

from rest_framework import serializers

from backend.apps.core.choices import EstadoPedido, RolUsuario, TipoAsiento
from backend.apps.core.services import AuditoriaService
from backend.apps.finance.models import LibroMayor
from backend.apps.finance.services import LibroMayorService
from backend.apps.inventory.services import StockService
from backend.apps.orders.models import ContadorPedido, DetallePedido, Pedido
from backend.common.api.exceptions import ApiError


class TransicionesPedido:
    TRANSICIONES = {
        EstadoPedido.BORRADOR: {
            EstadoPedido.CONFIRMADO: (RolUsuario.ADMINISTRADOR, RolUsuario.VENDEDOR_B2B),
            EstadoPedido.CANCELADO: (RolUsuario.ADMINISTRADOR, RolUsuario.VENDEDOR_B2B),
        },
        EstadoPedido.CONFIRMADO: {
            EstadoPedido.EN_TALLER: (RolUsuario.ADMINISTRADOR, RolUsuario.TECNICO_TALLER),
            EstadoPedido.CANCELADO: (RolUsuario.ADMINISTRADOR, RolUsuario.VENDEDOR_B2B),
        },
        EstadoPedido.EN_TALLER: {
            EstadoPedido.LISTO_PARA_DESPACHO: (RolUsuario.ADMINISTRADOR, RolUsuario.TECNICO_TALLER),
            EstadoPedido.CANCELADO: (
                RolUsuario.ADMINISTRADOR,
                RolUsuario.VENDEDOR_B2B,
                RolUsuario.TECNICO_TALLER,
            ),
        },
        EstadoPedido.LISTO_PARA_DESPACHO: {
            EstadoPedido.ENVIADO: (RolUsuario.ADMINISTRADOR, RolUsuario.ALMACEN),
            EstadoPedido.CANCELADO: (
                RolUsuario.ADMINISTRADOR,
                RolUsuario.VENDEDOR_B2B,
                RolUsuario.TECNICO_TALLER,
            ),
        },
    }

    ESTADOS_TERMINALES = (EstadoPedido.ENVIADO, EstadoPedido.CANCELADO)

    @classmethod
    def es_transicion_valida(cls, origen, destino):
        return destino in cls.TRANSICIONES.get(origen, {})

    @classmethod
    def roles_permitidos(cls, origen, destino):
        return cls.TRANSICIONES.get(origen, {}).get(destino, ())


class PedidoService:
    PREFIJO_NUMERO = 'PED-'

    @staticmethod
    def _siguiente_numero():
        with transaction.atomic():
            contador, _ = ContadorPedido.objects.select_for_update().get_or_create(pk=1)
            contador.ultimo_numero += 1
            contador.save(update_fields=['ultimo_numero'])
            return f'{PedidoService.PREFIJO_NUMERO}{contador.ultimo_numero:06d}'

    @staticmethod
    def _redondear_monto(valor):
        return valor.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)

    @classmethod
    def _calcular_totales(cls, detalles):
        subtotal = sum((d['precio_unitario'] * d['cantidad'] for d in detalles), Decimal('0.00'))
        subtotal = cls._redondear_monto(subtotal)
        impuesto = cls._redondear_monto(subtotal * settings.IMPUESTO_RATE)
        return subtotal, impuesto, subtotal + impuesto

    @classmethod
    def _crear_detalles(cls, pedido, detalles):
        for item in detalles:
            DetallePedido.objects.create(
                pedido=pedido,
                precio_total=cls._redondear_monto(item['precio_unitario'] * item['cantidad']),
                **item,
            )

    @staticmethod
    def _registrar(pedido, usuario, ip, accion, detalles=None):
        AuditoriaService.registrar(
            usuario=usuario,
            accion=accion,
            tabla_afectada=Pedido._meta.db_table,
            objeto_id=pedido.pk,
            detalles=detalles,
            direccion_ip=ip,
        )

    @classmethod
    def crear(cls, datos, usuario, direccion_ip=''):
        detalles_data = datos.pop('detalles', [])
        with transaction.atomic():
            datos['numero_pedido'] = cls._siguiente_numero()
            datos['usuario'] = usuario
            subtotal, impuesto, total = cls._calcular_totales(detalles_data)
            datos.update(subtotal=subtotal, impuesto=impuesto, total=total)
            pedido = Pedido.objects.create(**datos)
            cls._crear_detalles(pedido, detalles_data)
        return pedido

    @classmethod
    def actualizar(cls, pedido, datos, usuario, direccion_ip=''):
        if pedido.estado != EstadoPedido.BORRADOR:
            raise ApiError(
                'Solo se puede editar un pedido en estado borrador',
                status_code=409,
                code='pedido_no_editable',
            )

        detalles_data = datos.pop('detalles', None)
        with transaction.atomic():
            for attr, value in datos.items():
                setattr(pedido, attr, value)

            if detalles_data is not None:
                ids_mantenidos = []

                for item in detalles_data:
                    detalle_id = item.pop('id', None)
                    if detalle_id:
                        detalle = DetallePedido.objects.filter(pk=detalle_id, pedido=pedido).first()
                        if detalle is None:
                            raise serializers.ValidationError(
                                {'detalles': f'El detalle {detalle_id} no pertenece a este pedido'}
                            )
                        for attr, value in item.items():
                            setattr(detalle, attr, value)
                        detalle.precio_total = cls._redondear_monto(
                            detalle.precio_unitario * detalle.cantidad
                        )
                        detalle.save()
                        ids_mantenidos.append(detalle_id)
                    else:
                        detalle_nuevo = DetallePedido.objects.create(
                            pedido=pedido,
                            precio_total=cls._redondear_monto(item['precio_unitario'] * item['cantidad']),
                            **item,
                        )
                        ids_mantenidos.append(detalle_nuevo.pk)

                DetallePedido.objects.filter(pedido=pedido).exclude(pk__in=ids_mantenidos).delete()

            detalles = list(pedido.detalles.all().values('precio_unitario', 'cantidad'))
            subtotal, impuesto, total = cls._calcular_totales(detalles)
            pedido.subtotal = subtotal
            pedido.impuesto = impuesto
            pedido.total = total
            pedido.save()

        return pedido

    @classmethod
    def confirmar(cls, pedido, usuario, direccion_ip=''):
        with transaction.atomic():
            pedido = Pedido.objects.select_for_update().get(pk=pedido.pk)

            if not TransicionesPedido.es_transicion_valida(pedido.estado, EstadoPedido.CONFIRMADO):
                raise ApiError(
                    'No se puede confirmar un pedido que no está en borrador',
                    status_code=409,
                    code='transicion_invalida',
                )

            detalles = list(
                pedido.detalles.select_related('variante').order_by('variante_id').all()
            )

            for detalle in detalles:
                StockService.validar_disponibilidad(detalle.variante, detalle.cantidad)

            for detalle in detalles:
                StockService.ajustar_stock(
                    detalle.variante,
                    delta=-detalle.cantidad,
                    motivo='confirmar_pedido',
                    usuario=usuario,
                    direccion_ip=direccion_ip,
                )

            estado_anterior = pedido.estado
            pedido.estado = EstadoPedido.CONFIRMADO
            pedido.save(update_fields=['estado', 'actualizado_en'])
            cls._registrar(
                pedido,
                usuario,
                direccion_ip,
                'confirmar_pedido',
                {'estado_anterior': estado_anterior, 'estado_nuevo': EstadoPedido.CONFIRMADO},
            )
            LibroMayorService.crear_asiento(
                cliente=pedido.cliente,
                tipo_asiento=TipoAsiento.DEBITO,
                monto=pedido.total,
                descripcion=f'Pedido {pedido.numero_pedido}',
                pedido=pedido,
                usuario=usuario,
                direccion_ip=direccion_ip,
            )

        return pedido

    @classmethod
    def cambiar_estado(cls, pedido, nuevo_estado, usuario, direccion_ip='', motivo=''):
        if nuevo_estado == EstadoPedido.CANCELADO:
            return cls.cancelar(pedido, usuario, direccion_ip=direccion_ip, motivo=motivo)

        rol = getattr(usuario, 'rol', None)
        with transaction.atomic():
            pedido = Pedido.objects.select_for_update().get(pk=pedido.pk)

            if not TransicionesPedido.es_transicion_valida(pedido.estado, nuevo_estado):
                raise ApiError(
                    'La transición de estado no es válida',
                    status_code=409,
                    code='transicion_invalida',
                )
            if rol not in TransicionesPedido.roles_permitidos(pedido.estado, nuevo_estado):
                raise ApiError(
                    'Su rol no tiene permisos para realizar esta transición',
                    status_code=403,
                    code='transicion_no_permitida',
                )

            estado_anterior = pedido.estado
            pedido.estado = nuevo_estado
            pedido.save(update_fields=['estado', 'actualizado_en'])
            cls._registrar(
                pedido,
                usuario,
                direccion_ip,
                'cambiar_estado',
                {
                    'estado_anterior': estado_anterior,
                    'estado_nuevo': nuevo_estado,
                    'motivo': motivo,
                },
            )

        return pedido

    @classmethod
    def cancelar(cls, pedido, usuario, direccion_ip='', motivo=''):
        rol = getattr(usuario, 'rol', None)
        with transaction.atomic():
            pedido = Pedido.objects.select_for_update().get(pk=pedido.pk)

            if not TransicionesPedido.es_transicion_valida(pedido.estado, EstadoPedido.CANCELADO):
                raise ApiError(
                    'El pedido no se puede cancelar en su estado actual',
                    status_code=409,
                    code='transicion_invalida',
                )
            if rol not in TransicionesPedido.roles_permitidos(pedido.estado, EstadoPedido.CANCELADO):
                raise ApiError(
                    'Su rol no tiene permisos para realizar esta transición',
                    status_code=403,
                    code='transicion_no_permitida',
                )

            stock_descontado = pedido.estado != EstadoPedido.BORRADOR

            detalles = list(pedido.detalles.select_related('variante').order_by('variante_id').all())

            if stock_descontado:
                for detalle in detalles:
                    StockService.ajustar_stock(
                        detalle.variante,
                        delta=detalle.cantidad,
                        motivo='cancelar_pedido',
                        usuario=usuario,
                        direccion_ip=direccion_ip,
                    )

                asiento_debito = (
                    LibroMayor.objects.filter(pedido=pedido, tipo_asiento=TipoAsiento.DEBITO)
                    .order_by('-id')
                    .first()
                )
                if asiento_debito is not None:
                    LibroMayorService.revertir_asiento(
                        asiento_debito,
                        usuario=usuario,
                        direccion_ip=direccion_ip,
                    )

            estado_anterior = pedido.estado
            pedido.estado = EstadoPedido.CANCELADO
            pedido.save(update_fields=['estado', 'actualizado_en'])
            cls._registrar(
                pedido,
                usuario,
                direccion_ip,
                'cancelar_pedido',
                {
                    'estado_anterior': estado_anterior,
                    'estado_nuevo': EstadoPedido.CANCELADO,
                    'motivo': motivo,
                },
            )

        return pedido

    @classmethod
    def eliminar_borrador(cls, pedido, usuario, direccion_ip=''):
        if pedido.estado != EstadoPedido.BORRADOR:
            raise ApiError(
                'Solo se puede eliminar un pedido en estado borrador',
                status_code=409,
                code='pedido_no_eliminable',
            )
        pedido.delete()
        cls._registrar(pedido, usuario, direccion_ip, 'eliminar_pedido')
