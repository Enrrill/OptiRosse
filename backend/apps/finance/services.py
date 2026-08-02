from decimal import Decimal

from django.db import transaction
from django.db.models import Count, F, Sum
from django.utils import timezone

from backend.apps.clients.models import ClienteOptica
from backend.apps.core.choices import EstadoPago, EstadoPedido, RolUsuario, TipoAsiento
from backend.apps.core.services import AuditoriaService
from backend.apps.finance.models import LibroMayor, Pago
from backend.apps.inventory.models import VarianteProducto
from backend.apps.orders.models import Pedido
from backend.common.api.exceptions import ApiError


class LibroMayorService:
    @staticmethod
    def _saldo_previo(cliente):
        ultimo = LibroMayor.objects.filter(cliente=cliente).order_by('-id').first()
        return ultimo.saldo_posterior if ultimo else Decimal('0.00')

    @staticmethod
    def _tipo_inverso(tipo_asiento):
        if tipo_asiento == TipoAsiento.DEBITO:
            return TipoAsiento.CREDITO
        return TipoAsiento.DEBITO

    @classmethod
    def crear_asiento(
        cls,
        cliente,
        tipo_asiento,
        monto,
        descripcion,
        pedido=None,
        pago=None,
        asiento_origen=None,
        usuario=None,
        direccion_ip='',
    ):
        with transaction.atomic():
            cliente_bloqueado = ClienteOptica.objects.select_for_update().get(pk=cliente.pk)
            saldo_previo = cls._saldo_previo(cliente_bloqueado)

            if tipo_asiento == TipoAsiento.DEBITO:
                saldo_posterior = saldo_previo + monto
            else:
                saldo_posterior = saldo_previo - monto

            asiento = LibroMayor.objects.create(
                cliente=cliente_bloqueado,
                pedido=pedido,
                pago=pago,
                tipo_asiento=tipo_asiento,
                monto=monto,
                saldo_posterior=saldo_posterior,
                descripcion=descripcion,
                asiento_origen=asiento_origen,
            )
            AuditoriaService.registrar(
                usuario=usuario,
                accion='asiento_libro_mayor',
                tabla_afectada=LibroMayor._meta.db_table,
                objeto_id=asiento.pk,
                detalles={
                    'tipo_asiento': tipo_asiento,
                    'monto': str(monto),
                    'saldo_previo': str(saldo_previo),
                    'saldo_posterior': str(saldo_posterior),
                },
                direccion_ip=direccion_ip,
            )

        return asiento

    @classmethod
    def revertir_asiento(cls, asiento_origen, usuario=None, direccion_ip=''):
        if LibroMayor.objects.filter(asiento_origen=asiento_origen).exists():
            raise ApiError(
                'El asiento ya fue revertido',
                status_code=409,
                code='asiento_ya_revertido',
            )
        return cls.crear_asiento(
            cliente=asiento_origen.cliente,
            tipo_asiento=cls._tipo_inverso(asiento_origen.tipo_asiento),
            monto=asiento_origen.monto,
            descripcion=f'Reverso del asiento #{asiento_origen.pk}',
            pedido=asiento_origen.pedido,
            pago=asiento_origen.pago,
            asiento_origen=asiento_origen,
            usuario=usuario,
            direccion_ip=direccion_ip,
        )


class PagoService:
    @staticmethod
    def _registrar(pago, usuario, ip, accion, detalles=None):
        AuditoriaService.registrar(
            usuario=usuario,
            accion=accion,
            tabla_afectada=Pago._meta.db_table,
            objeto_id=pago.pk,
            detalles=detalles,
            direccion_ip=ip,
        )

    @staticmethod
    def crear(datos, usuario=None, direccion_ip=''):
        return Pago.objects.create(**datos)

    @classmethod
    def aprobar(cls, pago, usuario, direccion_ip='', motivo=''):
        with transaction.atomic():
            pago = Pago.objects.select_for_update().get(pk=pago.pk)

            if pago.estado != EstadoPago.PENDIENTE:
                raise ApiError(
                    'Solo se puede aprobar un pago pendiente',
                    status_code=409,
                    code='pago_estado_invalido',
                )

            if pago.metodo_pago.requiere_referencia and not pago.numero_referencia:
                raise ApiError(
                    'El método de pago requiere número de referencia',
                    status_code=409,
                    code='referencia_requerida',
                )

            pedido = None
            if pago.pedido_id:
                pedido = Pedido.objects.select_for_update().get(pk=pago.pedido_id)
                aprobados = (
                    Pago.objects.filter(pedido=pedido, estado=EstadoPago.APROBADO)
                    .exclude(pk=pago.pk)
                    .aggregate(total=Sum('monto'))['total']
                    or Decimal('0.00')
                )
                if aprobados + pago.monto > pedido.total:
                    raise ApiError(
                        'El pago excede el saldo del pedido',
                        status_code=409,
                        code='pago_excede_pedido',
                    )

            asiento = LibroMayorService.crear_asiento(
                cliente=pago.cliente,
                tipo_asiento=TipoAsiento.CREDITO,
                monto=pago.monto,
                descripcion=f'Pago #{pago.pk} - {pago.metodo_pago.nombre}',
                pedido=pedido,
                pago=pago,
                usuario=usuario,
                direccion_ip=direccion_ip,
            )

            pago.estado = EstadoPago.APROBADO
            pago.save(update_fields=['estado', 'actualizado_en'])
            cls._registrar(
                pago,
                usuario,
                direccion_ip,
                'aprobar_pago',
                {
                    'saldo_posterior': str(asiento.saldo_posterior),
                    'motivo': motivo,
                },
            )

        return pago

    @classmethod
    def rechazar(cls, pago, usuario, direccion_ip='', motivo=''):
        with transaction.atomic():
            pago = Pago.objects.select_for_update().get(pk=pago.pk)

            if pago.estado != EstadoPago.PENDIENTE:
                raise ApiError(
                    'Solo se puede rechazar un pago pendiente',
                    status_code=409,
                    code='pago_estado_invalido',
                )

            pago.estado = EstadoPago.RECHAZADO
            pago.motivo_rechazo = motivo
            pago.save(update_fields=['estado', 'motivo_rechazo', 'actualizado_en'])
            cls._registrar(
                pago,
                usuario,
                direccion_ip,
                'rechazar_pago',
                {'motivo': motivo},
            )

        return pago


ESTADOS_VENTA = (
    EstadoPedido.CONFIRMADO,
    EstadoPedido.EN_TALLER,
    EstadoPedido.LISTO_PARA_DESPACHO,
    EstadoPedido.ENVIADO,
)


class DashboardService:
    """Resumen de métricas role-aware para el panel de control del frontend."""

    @staticmethod
    def _pedidos_por_estado():
        conteos = (
            Pedido.objects.values('estado')
            .annotate(total=Count('id'))
            .values_list('estado', 'total')
        )
        conteo = dict(conteos)
        return {estado: conteo.get(estado, 0) for estado, _ in EstadoPedido.choices}

    @staticmethod
    def _total_vendido_mes(desde, hasta):
        total = Pedido.objects.filter(
            estado__in=ESTADOS_VENTA,
            creado_en__date__gte=desde,
            creado_en__date__lte=hasta,
        ).aggregate(total=Sum('total'))['total']
        return float(total or 0)

    @staticmethod
    def _pagos_pendientes():
        agregado = Pago.objects.filter(estado=EstadoPago.PENDIENTE).aggregate(
            cantidad=Count('id'),
            monto=Sum('monto'),
        )
        return {
            'cantidad': agregado['cantidad'] or 0,
            'monto': float(agregado['monto'] or 0),
        }

    @staticmethod
    def _saldo_por_cobrar():
        saldos = (
            LibroMayor.objects.order_by('cliente_id', '-id')
            .distinct('cliente_id')
            .values_list('saldo_posterior', flat=True)
        )
        return float(sum(saldos))

    @staticmethod
    def _recientes_pedidos(limite=5):
        pedidos = Pedido.objects.select_related('cliente').order_by('-creado_en')[:limite]
        return [
            {
                'id': p.pk,
                'numero_pedido': p.numero_pedido,
                'cliente_nombre': p.cliente.nombre_comercial,
                'estado': p.estado,
                'total': float(p.total),
                'creado_en': p.creado_en,
            }
            for p in pedidos
        ]

    @staticmethod
    def _recientes_pagos(limite=5):
        pagos = (
            Pago.objects.select_related('cliente', 'metodo_pago')
            .order_by('-creado_en')[:limite]
        )
        return [
            {
                'id': p.pk,
                'cliente_nombre': p.cliente.nombre_comercial,
                'metodo_pago_nombre': p.metodo_pago.nombre,
                'monto': float(p.monto),
                'estado': p.estado,
                'creado_en': p.creado_en,
            }
            for p in pagos
        ]

    @classmethod
    def resumen(cls, usuario):
        fecha = timezone.now().date()
        desde = fecha.replace(day=1)
        rol = usuario.rol

        kpis = {}
        recientes = {}

        if rol in (
            RolUsuario.ADMINISTRADOR,
            RolUsuario.VENDEDOR_B2B,
            RolUsuario.ALMACEN,
            RolUsuario.TECNICO_TALLER,
        ):
            kpis['pedidos_por_estado'] = cls._pedidos_por_estado()

        if rol in (RolUsuario.ADMINISTRADOR, RolUsuario.VENDEDOR_B2B, RolUsuario.CONTABILIDAD):
            kpis['total_vendido_mes'] = cls._total_vendido_mes(desde, fecha)

        if rol in (RolUsuario.ADMINISTRADOR, RolUsuario.VENDEDOR_B2B):
            kpis['clientes'] = ClienteOptica.objects.filter(activo=True).count()

        if rol in (RolUsuario.ADMINISTRADOR, RolUsuario.ALMACEN):
            kpis['stock_bajo'] = VarianteProducto.objects.filter(
                activo=True,
                stock__lte=F('alerta_stock_minimo'),
            ).count()

        if rol in (RolUsuario.ADMINISTRADOR, RolUsuario.CONTABILIDAD):
            kpis['pagos_pendientes'] = cls._pagos_pendientes()
            kpis['saldo_por_cobrar'] = cls._saldo_por_cobrar()

        recientes['pedidos'] = cls._recientes_pedidos()
        if rol in (RolUsuario.ADMINISTRADOR, RolUsuario.CONTABILIDAD):
            recientes['pagos'] = cls._recientes_pagos()

        return {
            'fecha': fecha.isoformat(),
            'periodo': {'desde': desde.isoformat(), 'hasta': fecha.isoformat()},
            'kpis': kpis,
            'recientes': recientes,
        }
