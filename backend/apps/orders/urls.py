from django.urls import path

from rest_framework.routers import SimpleRouter

from backend.apps.orders.views.pedido import (
    CambiarEstadoPedidoView,
    ConfirmarPedidoView,
    PedidoViewSet,
)
from backend.apps.orders.views.receta import RecetaOpticaViewSet

app_name = 'orders'

router = SimpleRouter()
router.register('recetas', RecetaOpticaViewSet, basename='receta')
router.register('pedidos', PedidoViewSet, basename='pedido')

urlpatterns = router.urls + [
    path('pedidos/<int:pk>/confirmar/', ConfirmarPedidoView.as_view(), name='pedido-confirmar'),
    path('pedidos/<int:pk>/cambiar-estado/', CambiarEstadoPedidoView.as_view(), name='pedido-cambiar-estado'),
]
