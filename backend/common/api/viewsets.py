from rest_framework import filters
from rest_framework.viewsets import ModelViewSet, ReadOnlyModelViewSet

from django_filters.rest_framework import DjangoFilterBackend

from backend.common.api.mixins import AuditoriaMixin
from backend.common.api.pagination import HybridPagination
from backend.common.api.response import api_response


class BaseModelViewSet(AuditoriaMixin, ModelViewSet):
    pagination_class = HybridPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    ordering = ('-creado_en',)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        instance = serializer.save()
        self._registrar_auditoria('crear', instance)
        return api_response(serializer.data, message='Creado correctamente', status=201)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        instance = serializer.save()
        self._registrar_auditoria('actualizar', instance)
        return api_response(serializer.data, message='Actualizado correctamente')

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self._registrar_auditoria('eliminar', instance)
        instance.delete()
        return api_response(message='Eliminado correctamente')


class BaseReadOnlyModelViewSet(ReadOnlyModelViewSet):
    pagination_class = HybridPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    ordering = ('-creado_en',)
