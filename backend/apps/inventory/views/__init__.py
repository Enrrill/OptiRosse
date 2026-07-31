from backend.apps.inventory.views.categoria import CategoriaViewSet
from backend.apps.inventory.views.producto import ProductoViewSet
from backend.apps.inventory.views.stock import AjustarStockView
from backend.apps.inventory.views.variante import VarianteProductoViewSet

__all__ = ['CategoriaViewSet', 'ProductoViewSet', 'VarianteProductoViewSet', 'AjustarStockView']
