from rest_framework.renderers import JSONRenderer
from rest_framework.response import Response


class EnvelopeJSONRenderer(JSONRenderer):
    media_type = 'application/json'

    def render(self, data, accepted_media_type=None, renderer_context=None):
        if data is None:
            data = {}

        status_code = renderer_context['response'].status_code if renderer_context else 200

        if status_code >= 400:
            return super().render(data, accepted_media_type, renderer_context)

        message = ''
        meta = {}
        payload = data

        if isinstance(data, dict) and 'results' in data and 'count' in data:
            payload = data['results']
            meta = {k: v for k, v in data.items() if k != 'results'}

        if isinstance(data, dict) and '_envelope' in data:
            envelope = data['_envelope']
            payload = data['data']
            message = envelope.get('message', '')
            meta = envelope.get('meta', {}) or {}

        return super().render(
            {
                'success': True,
                'data': payload,
                'errors': None,
                'message': message,
                'meta': meta,
            },
            accepted_media_type,
            renderer_context,
        )


def api_response(data=None, message='', meta=None, status=200):
    return Response(
        {
            'data': data,
            '_envelope': {'message': message, 'meta': meta or {}},
        },
        status=status,
    )
