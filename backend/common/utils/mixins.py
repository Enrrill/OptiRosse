from backend.common.utils.normalizers import (
    normalize_code,
    normalize_email,
    normalize_name,
    normalize_phone,
    normalize_rif,
    normalize_text,
)

FIELD_NORMALIZERS = {
    'correo': normalize_email,
    'email': normalize_email,
    'nombre': normalize_name,
    'apellido': normalize_name,
    'razon_social': normalize_name,
    'nombre_comercial': normalize_name,
    'nombre_paciente': normalize_name,
    'marca': normalize_name,
    'identificacion_fiscal': normalize_rif,
    'rif': normalize_rif,
    'telefono': normalize_phone,
    'phone': normalize_phone,
    'sku': normalize_code,
    'codigo_barras': normalize_code,
    'codigo_modelo': normalize_code,
    'numero_referencia': normalize_code,
    'direccion': normalize_text,
    'notas': normalize_text,
    'motivo': normalize_text,
    'motivo_rechazo': normalize_text,
}


class SanitizedSerializerMixin:
    """
    Mixin para serializers DRF que normaliza automáticamente los campos de texto
    al procesar datos de entrada (to_internal_value).
    """

    def to_internal_value(self, data):
        if isinstance(data, dict):
            mutable_data = data.copy()
            for key, val in mutable_data.items():
                if isinstance(val, str):
                    normalizer = FIELD_NORMALIZERS.get(key)
                    if normalizer:
                        mutable_data[key] = normalizer(val)
            data = mutable_data
        return super().to_internal_value(data)


class SanitizedModelMixin:
    """
    Mixin para modelos Django que sanitiza automáticamente los campos de texto
    antes de validar (clean) y guardar (save).
    """

    def sanitize_fields(self):
        for field_name, normalizer in FIELD_NORMALIZERS.items():
            if hasattr(self, field_name):
                val = getattr(self, field_name)
                if isinstance(val, str) and val:
                    setattr(self, field_name, normalizer(val))

    def clean(self):
        self.sanitize_fields()
        if hasattr(super(), 'clean'):
            super().clean()

    def save(self, *args, **kwargs):
        self.sanitize_fields()
        super().save(*args, **kwargs)
