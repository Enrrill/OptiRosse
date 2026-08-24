import re

SPECIAL_UPPER = {'c.a.', 's.a.', 's.r.l.', 's.a.s.', 'llc', 'inc', 'ca', 'sa', 'srl', 'rif', 'b2b'}
SPECIAL_LOWER = {'de', 'del', 'la', 'las', 'los', 'y', 'e', 'en', 'a', 'por', 'para', 'con'}


def normalize_email(email: str | None) -> str:
    """Limpia correo electrónico a minúsculas y remueve espacios."""
    if not email:
        return ''
    return email.strip().lower()


def normalize_name(name: str | None) -> str:
    """
    Capitaliza nombres, apellidos y razones sociales limpiamente.
    Respeta conectores en español ('de', 'la', 'del') y siglas ('C.A.', 'S.A.').
    """
    if not name:
        return ''

    # Reemplazar múltiples espacios con uno solo
    cleaned = re.sub(r'\s+', ' ', name.strip())
    if not cleaned:
        return ''

    words = cleaned.split(' ')
    normalized_words = []

    for i, word in enumerate(words):
        word_lower = word.lower()
        word_clean = word_lower.rstrip('.,')

        if word_clean in SPECIAL_UPPER or word_lower in SPECIAL_UPPER:
            if word_clean in ('ca', 'c.a.'):
                normalized_words.append('C.A.')
            elif word_clean in ('sa', 's.a.'):
                normalized_words.append('S.A.')
            elif word_clean in ('srl', 's.r.l.'):
                normalized_words.append('S.R.L.')
            else:
                normalized_words.append(word.upper())
        elif i > 0 and word_lower in SPECIAL_LOWER:
            normalized_words.append(word_lower)
        else:
            # Capitalizar primera letra de cada palabra respetando puntuación
            normalized_words.append(word.capitalize())

    return ' '.join(normalized_words)


def normalize_rif(rif: str | None) -> str:
    """
    Normaliza RIF venezolano al formato estándar: J-12345678-9 o V-12345678-0.
    """
    if not rif:
        return ''

    raw = re.sub(r'[^a-zA-Z0-9]', '', rif.strip()).upper()
    if not raw:
        return ''

    # Si empieza por letra J, V, E, G, P
    match = re.match(r'^([JVEGP])(\d{7,9})(\d)$', raw)
    if match:
        prefix, digits, dv = match.groups()
        return f'{prefix}-{digits}-{dv}'

    # Si sólo vienen dígitos (asumimos Venezolano V-)
    match_digits = re.match(r'^(\d{7,9})(\d)$', raw)
    if match_digits:
        digits, dv = match_digits.groups()
        return f'V-{digits}-{dv}'

    # Si no encaja estrictamente, retornar limpio en mayúsculas
    return raw


def normalize_phone(phone: str | None) -> str:
    """
    Normaliza números telefónicos al formato internacional moderno: +58 (414) 123-4567.
    """
    if not phone:
        return ''

    phone_clean = phone.strip()
    has_plus = phone_clean.startswith('+')
    digits = re.sub(r'\D', '', phone_clean)

    if not digits:
        return ''

    # Caso Venezolano: 04141234567 -> digits = 04141234567 (11 dígitos)
    if digits.startswith('0') and len(digits) == 11:
        codigo_area = digits[1:4]
        numero = digits[4:]
        return f'+58 ({codigo_area}) {numero[:3]}-{numero[3:]}'

    # Caso Venezolano con 58: 584141234567 (12 dígitos)
    if digits.startswith('58') and len(digits) == 12:
        codigo_area = digits[2:5]
        numero = digits[5:]
        return f'+58 ({codigo_area}) {numero[:3]}-{numero[3:]}'

    # Caso local 10 dígitos (ej. 4141234567) -> asumir +58
    if len(digits) == 10 and digits.startswith(('412', '414', '424', '416', '426', '212')):
        codigo_area = digits[:3]
        numero = digits[3:]
        return f'+58 ({codigo_area}) {numero[:3]}-{numero[3:]}'

    # Otros números genéricos: si tenía +, preservarlo
    prefix = '+' if has_plus else ''
    if len(digits) > 7:
        return f'{prefix}{digits[:-7]} {digits[-7:-4]}-{digits[-4:]}'
    return f'{prefix}{digits}'


def normalize_code(code: str | None) -> str:
    """
    Normaliza SKUs, códigos de barra y referencias: mayúsculas y sin espacios laterales.
    """
    if not code:
        return ''
    return re.sub(r'\s+', '', code.strip()).upper()


def normalize_text(text: str | None) -> str:
    """
    Limpia texto libre (direcciones, notas, descripciones).
    """
    if not text:
        return ''
    lines = [re.sub(r'[ \t]+', ' ', line.strip()) for line in text.strip().splitlines()]
    return '\n'.join(line for line in lines if line or lines.count('') < 2)
