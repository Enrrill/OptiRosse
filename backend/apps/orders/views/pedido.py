from django.shortcuts import get_object_or_404

from rest_framework import serializers
from rest_framework.views import APIView

from backend.apps.core.choices import EstadoPedido
from backend.apps.orders.filters import PedidoFilter
from backend.apps.orders.models import Pedido
from backend.apps.orders.permissions import PuedeConfirmarPedido, PuedeTransicionarPedido
from backend.apps.orders.serializers.pedido import PedidoSerializer
from backend.apps.orders.services import PedidoService
from backend.common.api.response import api_response
from backend.common.api.viewsets import BaseModelViewSet


class PedidoViewSet(BaseModelViewSet):
    queryset = (
        Pedido.objects.select_related('cliente', 'usuario', 'receta')
        .prefetch_related('detalles__variante__producto__categoria')
        .all()
    )
    serializer_class = PedidoSerializer
    filterset_class = PedidoFilter
    search_fields = ('numero_pedido', 'cliente__nombre_comercial', 'cliente__razon_social')

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        instance = serializer.save()
        instance._prefetched_objects_cache = {}
        self._registrar_auditoria('actualizar', instance)
        return api_response(self.get_serializer(instance).data, message='Actualizado correctamente')

    def destroy(self, request, *args, **kwargs):
        pedido = self.get_object()
        PedidoService.eliminar_borrador(
            pedido,
            usuario=request.user,
            direccion_ip=request.META.get('REMOTE_ADDR', ''),
        )
        return api_response(message='Pedido eliminado correctamente')


class ConfirmarPedidoSerializer(serializers.Serializer):
    notas = serializers.CharField(max_length=500, required=False, allow_blank=True)


class ConfirmarPedidoView(APIView):
    permission_classes = [PuedeConfirmarPedido]

    def post(self, request, pk):
        serializer = ConfirmarPedidoSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        pedido = get_object_or_404(
            Pedido.objects.select_related('cliente', 'usuario', 'receta')
            .prefetch_related('detalles__variante__producto__categoria'),
            pk=pk,
        )
        pedido = PedidoService.confirmar(
            pedido,
            usuario=request.user,
            direccion_ip=request.META.get('REMOTE_ADDR', ''),
        )
        return api_response(PedidoSerializer(pedido).data, message='Pedido confirmado correctamente')


class CambiarEstadoSerializer(serializers.Serializer):
    nuevo_estado = serializers.ChoiceField(choices=EstadoPedido.choices)
    motivo = serializers.CharField(max_length=500, required=False, allow_blank=True, default='')


class CambiarEstadoPedidoView(APIView):
    permission_classes = [PuedeTransicionarPedido]

    def post(self, request, pk):
        serializer = CambiarEstadoSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        pedido = get_object_or_404(
            Pedido.objects.select_related('cliente', 'usuario', 'receta')
            .prefetch_related('detalles__variante__producto__categoria'),
            pk=pk,
        )
        pedido = PedidoService.cambiar_estado(
            pedido,
            nuevo_estado=serializer.validated_data['nuevo_estado'],
            usuario=request.user,
            direccion_ip=request.META.get('REMOTE_ADDR', ''),
            motivo=serializer.validated_data.get('motivo', ''),
        )
        return api_response(PedidoSerializer(pedido).data, message='Estado del pedido actualizado')
