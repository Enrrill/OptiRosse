class AuditoriaMixin:
    def _registrar_auditoria(self, accion, instancia, detalles=None):
        from backend.apps.core.services import AuditoriaService

        request = getattr(self, 'request', None)
        usuario = getattr(request, 'user', None) if request else None
        direccion_ip = request.META.get('REMOTE_ADDR', '') if request else ''

        AuditoriaService.registrar(
            usuario=usuario,
            accion=accion,
            tabla_afectada=instancia._meta.db_table,
            objeto_id=instancia.pk,
            detalles=detalles,
            direccion_ip=direccion_ip,
        )
