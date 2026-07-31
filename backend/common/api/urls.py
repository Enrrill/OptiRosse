from django.urls import path

from backend.common.api.health import health

app_name = 'api'

urlpatterns = [
    path('health/', health, name='health'),
]
