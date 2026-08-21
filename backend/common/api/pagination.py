from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response


class HybridPagination(PageNumberPagination):
    """
    Paginación híbrida: PageNumber con page_size reducido + page_range para navegación numerada.
    - page_size = 15 (mejor UX, menos scrolling)
    - page_range: muestra páginas alrededor de la actual
    - Mantiene compatibilidad con next/prev links existentes
    """
    page_size = 15
    page_size_query_param = 'page_size'
    max_page_size = 100

    def get_paginated_response(self, data, request=None):
        """
        Response con datos de paginación mejorados para UI:
        - next/prev links tradicionales
        - page_range: páginas a mostrar alrededor de la actual
        - total_pages: total de páginas
        """
        page = self.page.number
        total_pages = self.page.paginator.num_pages

        # Calcular rango de páginas a mostrar (actual ± 2)
        left_index = max(1, page - 2)
        right_index = min(total_pages, page + 2)

        if total_pages <= 5:
            page_range = list(range(1, total_pages + 1))
        else:
            page_range = sorted(list(set([1] + list(range(left_index, right_index + 1)) + [total_pages])))

        return Response({
            'count': self.page.paginator.count,
            'next': self.get_next_link(),
            'previous': self.get_previous_link(),
            'results': data,
            'total_pages': total_pages,
            'page': page,
            'page_range': page_range,
        })


# Clase mantida para compatibilidad con código existente
StandardResultsSetPagination = HybridPagination
