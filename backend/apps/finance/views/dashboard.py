from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from backend.apps.finance.services import DashboardService
from backend.common.api.response import api_response


class DashboardResumenView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return api_response(DashboardService.resumen(request.user))
