from rest_framework.routers import SimpleRouter

from backend.apps.clients.views.cliente import ClienteOpticaViewSet

app_name = 'clients'

router = SimpleRouter()
router.register('clientes', ClienteOpticaViewSet, basename='cliente')

urlpatterns = router.urls
