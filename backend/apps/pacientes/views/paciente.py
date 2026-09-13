from rest_framework.decorators import action

from backend.apps.pacientes.filters import PacienteFilter
from backend.apps.pacientes.models import Paciente
from backend.apps.pacientes.permissions import EscrituraPacienteOLectura
from backend.apps.pacientes.serializers.paciente import PacienteSerializer
from backend.common.api.response import api_response
from backend.common.api.viewsets import BaseModelViewSet


class PacienteViewSet(BaseModelViewSet):
    queryset = Paciente.objects.select_related('cliente_optica').all()
    serializer_class = PacienteSerializer
    permission_classes = [EscrituraPacienteOLectura]
    filterset_class = PacienteFilter
    search_fields = ('nombre', 'apellido', 'cedula', 'telefono', 'correo')
    ordering_fields = ('nombre', 'apellido', 'creado_en', 'cedula')
    ordering = ('-creado_en',)

    def get_queryset(self):
        queryset = Paciente.objects.select_related('cliente_optica').all()
        if self.action == 'list' and 'activo' not in self.request.query_params:
            queryset = queryset.filter(activo=True)
        return queryset

    def destroy(self, request, *args, **kwargs):
        instancia = self.get_object()
        self._registrar_auditoria('desactivar', instancia)
        instancia.activo = False
        instancia.save(update_fields=['activo', 'actualizado_en'])
        return api_response(message='Paciente desactivado correctamente')

    @action(detail=True, methods=['get'], url_path='recetas')
    def recetas(self, request, pk=None):
        from backend.apps.orders.serializers.receta import RecetaOpticaSerializer

        paciente = self.get_object()
        recetas = paciente.recetas.all().order_by('-creado_en')
        serializer = RecetaOpticaSerializer(recetas, many=True)
        return api_response(serializer.data, message='Recetas del paciente obtenidas')
