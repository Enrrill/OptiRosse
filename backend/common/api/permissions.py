from rest_framework.permissions import SAFE_METHODS, BasePermission


def es_rol(*roles):
    class EsRol(BasePermission):
        def has_permission(self, request, view):
            user = getattr(request, 'user', None)
            if user is None or not getattr(user, 'is_authenticated', False):
                return False
            return getattr(user, 'rol', None) in roles

    return EsRol


def es_rol_o_lectura(*roles):
    class EsRolOLectura(BasePermission):
        def has_permission(self, request, view):
            user = getattr(request, 'user', None)
            if user is None or not getattr(user, 'is_authenticated', False):
                return False
            if request.method in SAFE_METHODS:
                return True
            return getattr(user, 'rol', None) in roles

    return EsRolOLectura


class SoloLectura(BasePermission):
    def has_permission(self, request, view):
        return request.method in SAFE_METHODS
