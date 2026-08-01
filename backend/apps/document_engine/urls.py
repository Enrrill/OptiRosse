from django.urls import path

from rest_framework.routers import SimpleRouter

from backend.apps.document_engine.views.generar import GenerarDocumentoView
from backend.apps.document_engine.views.plantilla import PlantillaDocumentoViewSet

app_name = 'document_engine'

router = SimpleRouter()
router.register('plantillas', PlantillaDocumentoViewSet, basename='plantilla')

urlpatterns = router.urls + [
    path('plantillas/<int:pk>/generar/', GenerarDocumentoView.as_view(), name='plantilla-generar'),
]
