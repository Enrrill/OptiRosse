class AuditoriaMixin:
    def _registrar_auditoria(self, accion, instancia, detalles=None):
        raise NotImplementedError('Implementar auditoría en la Fase 1 (core.AuditoriaService)')
