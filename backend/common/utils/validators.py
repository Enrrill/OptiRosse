import re
from django.core.exceptions import ValidationError
from backend.common.utils.normalizers import normalize_rif


def validate_rif_format(value: str) -> None:
    """Valida que el RIF tenga la estructura venezolana estándar X-XXXXXXXX-X."""
    if not value:
        return
    normalized = normalize_rif(value)
    if not re.match(r'^[JVEGP]-\d{7,9}-\d$', normalized):
        raise ValidationError(
            'Formato de RIF inválido. Debe tener la estructura J-12345678-9, V-12345678-0, etc.'
        )
