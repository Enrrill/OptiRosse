from django.shortcuts import get_object_or_404

from rest_framework import serializers
from rest_framework.views import APIView

from backend.apps.inventory.models import VarianteProducto
from backend.apps.inventory.permissions import EscrituraInventario
from backend.apps.inventory.serializers.variante import VarianteProductoSerializer
from backend.apps.inventory.services import StockService
from backend.common.api.response import api_response


class AjustarStockSerializer(serializers.Serializer):
    cantidad = serializers.IntegerField()
    motivo = serializers.CharField(max_length=255, required=False, allow_blank=True, default='')


class AjustarStockView(APIView):
    permission_classes = [EscrituraInventario]

    def post(self, request, pk):
        serializer = AjustarStockSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        variante = get_object_or_404(VarianteProducto.objects.select_related('producto'), pk=pk)
        variante = StockService.ajustar_stock(
            variante,
            delta=serializer.validated_data['cantidad'],
            motivo=serializer.validated_data.get('motivo', ''),
            usuario=request.user,
            direccion_ip=request.META.get('REMOTE_ADDR', ''),
        )
        return api_response(
            VarianteProductoSerializer(variante).data,
            message='Stock ajustado correctamente',
        )
