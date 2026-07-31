from django.http import Http404

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny

from backend.common.api.exceptions import api_exception_handler


@api_view(['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'])
@permission_classes([AllowAny])
def ruta_no_encontrada(request, *args, **kwargs):
    return api_exception_handler(Http404(), {})


def handler_404(request, exception=None):
    return api_exception_handler(Http404(), {})
