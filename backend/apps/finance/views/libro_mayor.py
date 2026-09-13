from backend.apps.finance.filters import LibroMayorFilter
from backend.apps.finance.models import LibroMayor
from backend.apps.finance.permissions import LecturaLibroMayor
from backend.apps.finance.serializers.libro_mayor import LibroMayorSerializer
from backend.common.api.viewsets import BaseReadOnlyModelViewSet


class LibroMayorViewSet(BaseReadOnlyModelViewSet):
    queryset = LibroMayor.objects.select_related('cliente', 'paciente', 'pedido', 'pago').all()
    serializer_class = LibroMayorSerializer
    permission_classes = [LecturaLibroMayor]
    filterset_class = LibroMayorFilter
    search_fields = (
        'cliente__razon_social',
        'cliente__nombre_comercial',
        'paciente__nombre',
        'paciente__apellido',
        'descripcion',
    )
    ordering = ('-id',)
