from django.shortcuts import get_object_or_404

from rest_framework import serializers
from rest_framework.views import APIView

from backend.apps.finance.filters import PagoFilter
from backend.apps.finance.models import Pago
from backend.apps.finance.permissions import GestionPago
from backend.apps.finance.serializers.pago import PagoSerializer
from backend.apps.finance.services import PagoService
from backend.common.api.exceptions import ApiError
from backend.common.api.response import api_response
from backend.common.api.viewsets import BaseModelViewSet


class PagoViewSet(BaseModelViewSet):
    queryset = Pago.objects.select_related('cliente', 'pedido', 'metodo_pago').all()
    serializer_class = PagoSerializer
    permission_classes = [GestionPago]
    filterset_class = PagoFilter
    search_fields = ('numero_referencia', 'cliente__nombre_comercial', 'cliente__razon_social')

    def update(self, request, *args, **kwargs):
        raise ApiError(
            'Un pago no se puede editar directamente; use aprobar o rechazar',
            status_code=409,
            code='pago_no_editable',
        )

    def partial_update(self, request, *args, **kwargs):
        raise ApiError(
            'Un pago no se puede editar directamente; use aprobar o rechazar',
            status_code=409,
            code='pago_no_editable',
        )

    def destroy(self, request, *args, **kwargs):
        raise ApiError(
            'Un pago no se puede eliminar para preservar la integridad del libro mayor',
            status_code=409,
            code='pago_no_eliminable',
        )


class AprobarPagoSerializer(serializers.Serializer):
    motivo = serializers.CharField(max_length=500, required=False, allow_blank=True, default='')


class AprobarPagoView(APIView):
    permission_classes = [GestionPago]

    def post(self, request, pk):
        serializer = AprobarPagoSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        pago = get_object_or_404(
            Pago.objects.select_related('cliente', 'pedido', 'metodo_pago'),
            pk=pk,
        )
        pago = PagoService.aprobar(
            pago,
            usuario=request.user,
            direccion_ip=request.META.get('REMOTE_ADDR', ''),
            motivo=serializer.validated_data.get('motivo', ''),
        )
        return api_response(PagoSerializer(pago).data, message='Pago aprobado correctamente')


class RechazarPagoSerializer(serializers.Serializer):
    motivo = serializers.CharField(max_length=255)


class RechazarPagoView(APIView):
    permission_classes = [GestionPago]

    def post(self, request, pk):
        serializer = RechazarPagoSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        pago = get_object_or_404(
            Pago.objects.select_related('cliente', 'pedido', 'metodo_pago'),
            pk=pk,
        )
        pago = PagoService.rechazar(
            pago,
            usuario=request.user,
            direccion_ip=request.META.get('REMOTE_ADDR', ''),
            motivo=serializer.validated_data['motivo'],
        )
        return api_response(PagoSerializer(pago).data, message='Pago rechazado correctamente')
