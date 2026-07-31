from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny

from backend.common.api.response import api_response


@api_view(['GET'])
@permission_classes([AllowAny])
def health(request):
    return api_response({'status': 'ok', 'app': 'optirosse-api', 'version': '0.1.0'})
