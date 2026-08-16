from backend.apps.core.filters import RegistroAuditoriaFilter
from backend.apps.core.models import RegistroAuditoria
from backend.apps.core.permissions import EsAdministrador
from backend.apps.core.serializers.auditoria import RegistroAuditoriaSerializer
from backend.common.api.viewsets import BaseReadOnlyModelViewSet


class RegistroAuditoriaViewSet(BaseReadOnlyModelViewSet):
    queryset = RegistroAuditoria.objects.select_related('usuario').all()
    serializer_class = RegistroAuditoriaSerializer
    permission_classes = [EsAdministrador]
    filterset_class = RegistroAuditoriaFilter
    search_fields = ('accion', 'tabla_afectada', 'usuario__nombre_usuario', 'usuario__correo')
    ordering = ('-creado_en', '-id')