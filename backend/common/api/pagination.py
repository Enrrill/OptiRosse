from rest_framework.pagination import PageNumberPagination


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

    def get_paginated_response(self, data, request):
        """
        Response con datos de paginación mejorados para UI:
        - next/prev links tradicionales
        - page_range: páginas a mostrar alrededor de la actual
        - total_pages: total de páginas
        """
        page = self.page.number
        total_pages = self.paginator.num_pages

        # Calcular rango de páginas a mostrar (actual ± 2)
        left_index = max(1, page - 2)
        right_index = min(total_pages, page + 2)

        if total_pages <= 5:
            page_range = list(range(1, total_pages + 1))
        else:
            page_range = list(range(left_index, right_index + 1))
            # Ajustar display para primeros/últimos casos
            if page <= 3:
                page_range = list(range(1, min(6, total_pages + 1)))
                if total_pages > 5:
                    page_range.append(total_pages)
            elif page >= total_pages - 2:
                page_range = [1] + list(range(max(1, total_pages - 4), total_pages + 1))

        return Response({
            'success': True,
            'data': data,
            'meta': {
                'count': self.page.paginator.count,
                'next': self.get_next_link(request),
                'previous': self.get_previous_link(request),
                'total_pages': total_pages,
                'page': page,
                'page_range': page_range,
            },
            'errors': None,
            'message': None,
        })


# Clase mantida para compatibilidad con código existente
StandardResultsSetPagination = HybridPagination
