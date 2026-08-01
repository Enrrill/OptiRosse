from django.urls import path

from rest_framework.routers import SimpleRouter

from backend.apps.finance.views.libro_mayor import LibroMayorViewSet
from backend.apps.finance.views.metodo_pago import MetodoPagoViewSet
from backend.apps.finance.views.pago import AprobarPagoView, PagoViewSet, RechazarPagoView

app_name = 'finance'

router = SimpleRouter()
router.register('metodos-pago', MetodoPagoViewSet, basename='metodo-pago')
router.register('pagos', PagoViewSet, basename='pago')
router.register('libro-mayor', LibroMayorViewSet, basename='libro-mayor')

urlpatterns = router.urls + [
    path('pagos/<int:pk>/aprobar/', AprobarPagoView.as_view(), name='pago-aprobar'),
    path('pagos/<int:pk>/rechazar/', RechazarPagoView.as_view(), name='pago-rechazar'),
]
