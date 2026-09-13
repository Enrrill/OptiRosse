from rest_framework.routers import SimpleRouter

from backend.apps.pacientes.views.paciente import PacienteViewSet

app_name = 'pacientes'

router = SimpleRouter()
router.register('pacientes', PacienteViewSet, basename='paciente')

urlpatterns = router.urls
