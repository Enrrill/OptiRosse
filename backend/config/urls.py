"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import include, path, re_path

from backend.common.api.errors import ruta_no_encontrada

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/', include('backend.common.api.urls')),
    re_path(r'.*', ruta_no_encontrada, name='ruta-no-encontrada'),
]

handler404 = 'backend.common.api.errors.handler_404'
