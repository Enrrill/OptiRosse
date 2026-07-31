from django.db import transaction
from django.db.models import F

from backend.apps.core.services import AuditoriaService
from backend.apps.inventory.models import VarianteProducto
from backend.common.api.exceptions import ApiError


class StockService:
    @staticmethod
    def validar_disponibilidad(variante, cantidad):
        if cantidad <= 0:
            raise ApiError(
                'La cantidad debe ser mayor a cero',
                code='cantidad_invalida',
            )
        if variante.stock < cantidad:
            raise ApiError(
                'Stock insuficiente para la variante',
                code='stock_insuficiente',
            )
        return True

    @classmethod
    def ajustar_stock(cls, variante, delta, motivo='', usuario=None, direccion_ip=''):
        if delta == 0:
            return variante

        with transaction.atomic():
            bloqueada = VarianteProducto.objects.select_for_update().get(pk=variante.pk)

            if delta < 0:
                cls.validar_disponibilidad(bloqueada, abs(delta))

            VarianteProducto.objects.filter(pk=bloqueada.pk).update(stock=F('stock') + delta)
            bloqueada.refresh_from_db()

            AuditoriaService.registrar(
                usuario=usuario,
                accion='ajuste_stock',
                tabla_afectada=VarianteProducto._meta.db_table,
                objeto_id=bloqueada.pk,
                detalles={'delta': delta, 'motivo': motivo},
                direccion_ip=direccion_ip,
            )

        return bloqueada
