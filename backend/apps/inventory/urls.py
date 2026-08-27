from django.urls import path

from rest_framework.routers import SimpleRouter

from backend.apps.inventory.views.categoria import CategoriaViewSet
from backend.apps.inventory.views.marca import MarcaViewSet
from backend.apps.inventory.views.producto import ProductoViewSet
from backend.apps.inventory.views.stock import AjustarStockView
from backend.apps.inventory.views.variante import VarianteProductoViewSet

app_name = 'inventory'

router = SimpleRouter()
router.register('categorias', CategoriaViewSet, basename='categoria')
router.register('marcas', MarcaViewSet, basename='marca')
router.register('productos', ProductoViewSet, basename='producto')
router.register('variantes', VarianteProductoViewSet, basename='variante')

urlpatterns = router.urls + [
    path('variantes/<int:pk>/ajustar-stock/', AjustarStockView.as_view(), name='variante-ajustar-stock'),
]
