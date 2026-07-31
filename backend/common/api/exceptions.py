from django.http import Http404

from rest_framework import exceptions, status
from rest_framework.response import Response
from rest_framework.views import exception_handler as drf_exception_handler


class ApiError(Exception):
    def __init__(self, message, status_code=status.HTTP_409_CONFLICT, code='error', errors=None):
        self.message = message
        self.status_code = status_code
        self.code = code
        self.errors = errors
        super().__init__(message)


def api_exception_handler(exc, context):
    if isinstance(exc, ApiError):
        return Response(
            {
                'success': False,
                'data': None,
                'errors': exc.errors or [{'code': exc.code, 'detail': exc.message}],
                'message': exc.message,
                'meta': {},
            },
            status=exc.status_code,
        )

    response = drf_exception_handler(exc, context)
    if response is None:
        return None

    if isinstance(exc, exceptions.ValidationError):
        message = 'Error de validación'
    elif isinstance(exc, Http404):
        message = 'Recurso no encontrado'
    elif isinstance(exc, (exceptions.NotAuthenticated, exceptions.AuthenticationFailed)):
        message = 'No autenticado'
    elif isinstance(exc, exceptions.PermissionDenied):
        message = 'No tiene permisos para realizar esta acción'
    elif isinstance(exc, exceptions.MethodNotAllowed):
        message = 'Método no permitido'
    elif isinstance(exc, exceptions.ParseError):
        message = 'Error de parseo de la solicitud'
    else:
        message = 'Error de la solicitud'

    response.data = {
        'success': False,
        'data': None,
        'errors': response.data,
        'message': message,
        'meta': {},
    }
    return response
