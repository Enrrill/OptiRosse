# Plan de Refinamiento Backend — Pedidos y Recetas
## OptiRosse · Versión 2.0 del dominio

> **Alcance:** Solo backend (modelos, serializers, services, views, choices, migrations).
> No se toca el frontend hasta que el backend esté estabilizado y migrado.
> No se implementa nada de lo que no esté en este documento.

---

## Decisiones de Diseño Confirmadas

| # | Decisión | Detalle |
|---|---|---|
| D1 | **Cliente y Paciente pueden coexistir en la misma persona** | Una optometrista puede comprar monturas/cristales B2B y también ser paciente con su propia receta |
| D2 | **Receta → Pedido es 1:N** | Una receta puede originar múltiples pedidos (relaboraciones, segundos pares) |
| D3 | **La receta se vincula directamente al Paciente** | No más `nombre_paciente` de texto libre como único identificador |
| D4 | **Paciente existe de forma independiente** | Una persona natural puede existir en el sistema sin ser cliente B2B |
| D5 | **Personas naturales pueden tener crédito/abonos** | El módulo financiero debe soportar pagos parciales para ambos tipos |
| D6 | **Sin fecha de vigencia en receta** | Cuando vence, el óptico edita la receta directamente |
| D7 | **Solo 2 roles activos** | `ADMINISTRADOR` y `VENDEDORA`. El resto se elimina |
| D8 | **Estado final unificado: `ENTREGADO`** | Reemplaza `ENVIADO` — cubre retiro en tienda y despacho a domicilio |
| D9 | **Flujo de venta rápida (mostrador)** | Pipeline corto: `BORRADOR → CONFIRMADO → ENTREGADO` |
| D10 | **Pedidos se mandan a laboratorio externo** | No hay taller propio. El estado `EN_TALLER` refleja trabajo externo |

---

## Estado Actual vs Estado Deseado

### Modelo de dominio actual
```
ClienteOptica (B2B obligatorio, RIF único)
    └── Pedido (solo acepta ClienteOptica)
            └── DetallePedido → VarianteProducto
            └── RecetaOptica (OneToOne, sin dueño, sin timestamp)
```

### Modelo de dominio nuevo
```
ClienteOptica (B2B — sin cambios estructurales)
│
Paciente (nuevo — persona natural)
│   └── RecetaOptica (FK 1:N, con timestamp)
│
Pedido (acepta ClienteOptica O Paciente, no ambos)
    ├── DetallePedido → VarianteProducto (sin cambios)
    ├── receta (FK nullable → RecetaOptica, 1:N)
    └── receta_snapshot (JSON — copia de la graduación al confirmar)
```

---

## Cambios por Módulo

---

### 1. `core/choices.py`

#### `RolUsuario` — Reducir a 2 roles

```python
# ANTES
class RolUsuario(models.TextChoices):
    ADMINISTRADOR  = 'administrador', 'Administrador'
    VENDEDOR_B2B   = 'vendedor_b2b', 'Vendedor B2B'
    ALMACEN        = 'almacen', 'Almacén'
    TECNICO_TALLER = 'tecnico_taller', 'Técnico de Taller'
    CONTABILIDAD   = 'contabilidad', 'Contabilidad'

# DESPUÉS
class RolUsuario(models.TextChoices):
    ADMINISTRADOR = 'administrador', 'Administrador'
    VENDEDORA     = 'vendedora', 'Vendedora'
```

> ⚠️ **Data migration requerida:** usuarios con roles eliminados
> (`almacen`, `tecnico_taller`, `contabilidad`, `vendedor_b2b`) se
> migran a `vendedora`.

#### `EstadoPedido` — Renombrar 2 estados, reemplazar 1

```python
# DESPUÉS
class EstadoPedido(models.TextChoices):
    BORRADOR           = 'borrador',           'Borrador'
    CONFIRMADO         = 'confirmado',         'Confirmado'
    EN_LABORATORIO     = 'en_laboratorio',     'En Laboratorio'     # era EN_TALLER
    LISTO_PARA_ENTREGA = 'listo_para_entrega', 'Listo para Entrega' # era LISTO_PARA_DESPACHO
    ENTREGADO          = 'entregado',          'Entregado'          # era ENVIADO
    CANCELADO          = 'cancelado',          'Cancelado'
```

> - `EN_TALLER` → `EN_LABORATORIO`: refleja la realidad (laboratorio externo).
> - `LISTO_PARA_DESPACHO` → `LISTO_PARA_ENTREGA`: más neutral.
> - `ENVIADO` → `ENTREGADO`: unifica retiro en tienda y despacho a domicilio.

#### `TipoPedido` — Nuevo

```python
class TipoPedido(models.TextChoices):
    LABORATORIO = 'laboratorio', 'Con Laboratorio'   # flujo de 5 estados
    MOSTRADOR   = 'mostrador',   'Venta de Mostrador' # flujo de 3 estados
```

---

### 2. `clients/` — Sin cambios

`ClienteOptica` no se modifica. Todos sus campos y relaciones permanecen intactos.
El flujo B2B existente no se interrumpe.

---

### 3. `pacientes/` — App nueva

Crear `backend/apps/pacientes/` con estructura estándar del proyecto.

#### Modelo `Paciente`

```python
class Paciente(SanitizedModelMixin, TimeStampedModel, ActivoMixin):
    nombre           = models.CharField('nombre', max_length=100)
    apellido         = models.CharField('apellido', max_length=100, blank=True, default='')
    cedula           = models.CharField('cédula', max_length=20, unique=True, null=True, blank=True)
    telefono         = models.CharField('teléfono', max_length=30, blank=True, default='')
    correo           = models.EmailField('correo', blank=True, default='')
    fecha_nacimiento = models.DateField('fecha de nacimiento', null=True, blank=True)
    notas            = models.TextField('notas', blank=True, default='')

    # Relación opcional con cliente B2B
    # Caso: optometrista que es también distribuidor B2B
    cliente_optica = models.ForeignKey(
        'clients.ClienteOptica',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='pacientes',
        verbose_name='cliente óptica asociado',
    )

    class Meta:
        verbose_name = 'paciente'
        verbose_name_plural = 'pacientes'
        db_table = 'pacientes'
        indexes = [
            models.Index(fields=['cedula'], name='pacientes_idx_cedula'),
        ]
```

**Notas:**
- `cedula` es opcional pero único si se provee — permite identificar sin inventar RIF.
- `cliente_optica` FK nullable — cubre el caso de persona que también es cliente B2B.
- Hereda `TimeStampedModel` + `ActivoMixin` — historial completo.

**URLs del nuevo app:**
```
GET/POST  /api/v1/pacientes/           → listado y creación
GET/PUT   /api/v1/pacientes/{id}/      → detalle y edición
GET       /api/v1/pacientes/{id}/recetas/  → historial de recetas del paciente
```

---

### 4. `orders/models.py`

#### `RecetaOptica` — Añadir FK a Paciente y timestamp

```python
# CAMBIOS
class RecetaOptica(SanitizedModelMixin, TimeStampedModel, ActivoMixin):  # añade TimeStampedModel
    paciente = models.ForeignKey(                                         # NUEVO — reemplaza nombre_paciente
        'pacientes.Paciente',
        on_delete=models.RESTRICT,
        related_name='recetas',
        verbose_name='paciente',
    )

    # --- Campos ópticos sin cambio ---
    od_esfera   = ...
    od_cilindro = ...
    od_eje      = ...
    od_adicion  = ...
    oi_esfera   = ...
    oi_cilindro = ...
    oi_eje      = ...
    oi_adicion  = ...
    distancia_pupilar = ...

    medico_prescriptor = models.CharField(   # NUEVO — opcional
        'médico prescriptor', max_length=150, blank=True, default=''
    )
    notas = ...  # sin cambio

    # ELIMINADO: nombre_paciente (campo de texto libre)
```

> ⚠️ **Data migration:** Por cada `RecetaOptica` existente con `nombre_paciente`,
> se crea un `Paciente(nombre=nombre_paciente)` y se asigna la FK.

#### `Pedido` — Añadir Paciente, tipo_pedido, cambiar receta a FK

```python
class Pedido(SanitizedModelMixin, TimeStampedModel):
    numero_pedido = ...  # sin cambio
    usuario       = ...  # sin cambio

    # ANTES: cliente FK obligatorio
    # DESPUÉS: exactamente uno de los dos
    cliente  = models.ForeignKey(
        'clients.ClienteOptica',
        on_delete=models.RESTRICT,
        null=True, blank=True,       # ahora nullable
        verbose_name='cliente óptica',
    )
    paciente = models.ForeignKey(    # NUEVO
        'pacientes.Paciente',
        on_delete=models.RESTRICT,
        null=True, blank=True,
        verbose_name='paciente',
    )

    tipo_pedido = models.CharField(  # NUEVO
        'tipo de pedido',
        max_length=20,
        choices=TipoPedido.choices,
        default=TipoPedido.LABORATORIO,
    )

    # ANTES: OneToOneField (receta usable en 1 solo pedido)
    # DESPUÉS: ForeignKey (receta reutilizable)
    receta = models.ForeignKey(
        RecetaOptica,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='pedidos',      # una receta puede tener N pedidos
        verbose_name='receta óptica',
    )
    receta_snapshot = models.JSONField(  # NUEVO — copia inmutable al confirmar
        'snapshot de receta',
        null=True, blank=True,
    )

    estado   = ...  # sin cambio de campo — solo cambian los choices
    subtotal = ...  # sin cambio
    impuesto = ...  # sin cambio
    total    = ...  # sin cambio
    notas    = ...  # sin cambio

    class Meta:
        ...
        constraints = [
            # Exactamente uno de cliente o paciente
            models.CheckConstraint(
                condition=(
                    models.Q(cliente__isnull=False, paciente__isnull=True) |
                    models.Q(cliente__isnull=True, paciente__isnull=False)
                ),
                name='pedido_exactamente_un_destinatario',
            )
        ]
```

> ⚠️ **Data migration:** Todos los pedidos existentes tienen `cliente` asignado —
> se les asigna `tipo_pedido=LABORATORIO` y se deja `paciente=NULL`. No hay riesgo.

---

### 5. `orders/services.py`

#### `TransicionesPedido` — Pipelines según tipo de pedido

```python
class TransicionesPedido:

    # Flujo completo: pedidos con laboratorio externo
    PIPELINE_LABORATORIO = {
        EstadoPedido.BORRADOR: {
            EstadoPedido.CANCELADO: (RolUsuario.ADMINISTRADOR, RolUsuario.VENDEDORA),
        },
        EstadoPedido.CONFIRMADO: {
            EstadoPedido.EN_LABORATORIO: (RolUsuario.ADMINISTRADOR, RolUsuario.VENDEDORA),
            EstadoPedido.CANCELADO:      (RolUsuario.ADMINISTRADOR, RolUsuario.VENDEDORA),
        },
        EstadoPedido.EN_LABORATORIO: {
            EstadoPedido.LISTO_PARA_ENTREGA: (RolUsuario.ADMINISTRADOR, RolUsuario.VENDEDORA),
            EstadoPedido.CANCELADO:          (RolUsuario.ADMINISTRADOR, RolUsuario.VENDEDORA),
        },
        EstadoPedido.LISTO_PARA_ENTREGA: {
            EstadoPedido.ENTREGADO: (RolUsuario.ADMINISTRADOR, RolUsuario.VENDEDORA),
            EstadoPedido.CANCELADO: (RolUsuario.ADMINISTRADOR, RolUsuario.VENDEDORA),
        },
    }

    # Flujo corto: venta de mostrador
    PIPELINE_MOSTRADOR = {
        EstadoPedido.BORRADOR: {
            EstadoPedido.CANCELADO: (RolUsuario.ADMINISTRADOR, RolUsuario.VENDEDORA),
        },
        EstadoPedido.CONFIRMADO: {
            EstadoPedido.ENTREGADO: (RolUsuario.ADMINISTRADOR, RolUsuario.VENDEDORA),
            EstadoPedido.CANCELADO: (RolUsuario.ADMINISTRADOR, RolUsuario.VENDEDORA),
        },
    }

    ESTADOS_TERMINALES = (EstadoPedido.ENTREGADO, EstadoPedido.CANCELADO)

    @classmethod
    def _pipeline(cls, pedido):
        if pedido.tipo_pedido == TipoPedido.MOSTRADOR:
            return cls.PIPELINE_MOSTRADOR
        return cls.PIPELINE_LABORATORIO

    @classmethod
    def es_transicion_valida(cls, pedido, destino):
        return destino in cls._pipeline(pedido).get(pedido.estado, {})

    @classmethod
    def roles_permitidos(cls, pedido, destino):
        return cls._pipeline(pedido).get(pedido.estado, {}).get(destino, ())
```

#### `PedidoService.confirmar` — Capturar `receta_snapshot`

Al confirmar, si el pedido tiene receta se guarda una copia JSON inmutable.
Así aunque la receta se edite después, el pedido histórico conserva los datos exactos.

```python
@staticmethod
def _snapshot_receta(receta):
    return {
        'receta_id':         receta.pk,
        'paciente':          str(receta.paciente),
        'od_esfera':         str(receta.od_esfera),
        'od_cilindro':       str(receta.od_cilindro),
        'od_eje':            receta.od_eje,
        'od_adicion':        str(receta.od_adicion),
        'oi_esfera':         str(receta.oi_esfera),
        'oi_cilindro':       str(receta.oi_cilindro),
        'oi_eje':            receta.oi_eje,
        'oi_adicion':        str(receta.oi_adicion),
        'distancia_pupilar': str(receta.distancia_pupilar),
        'medico_prescriptor': receta.medico_prescriptor,
        'receta_creada_en':  receta.creado_en.isoformat(),
    }
```

#### `PedidoService.crear` — Validar destinatario único

```python
cliente  = datos.get('cliente')
paciente = datos.get('paciente')
if bool(cliente) == bool(paciente):
    raise ApiError(
        'Debe especificar exactamente un destinatario: cliente óptica o paciente.',
        status_code=400,
        code='destinatario_invalido',
    )
```

---

### 6. `finance/models.py`

`Pago` y `LibroMayor` actualmente requieren `cliente` (FK obligatoria a `ClienteOptica`).
Se hace nullable y se añade `paciente` como alternativa:

```python
# En Pago y LibroMayor:
cliente  = models.ForeignKey(ClienteOptica, ..., null=True, blank=True)  # ahora nullable
paciente = models.ForeignKey('pacientes.Paciente', ..., null=True, blank=True)  # nuevo
```

`LibroMayorService.crear_asiento` acepta `paciente=` como parámetro alternativo a `cliente=`.

> ⚠️ **Data migration:** Los registros de `Pago` y `LibroMayor` existentes
> ya tienen `cliente` asignado — no se tocan. Solo los nuevos registros
> para pacientes usarán el campo `paciente`.

---

### 7. `permissions.py` en todos los apps — Simplificar

```python
# Antes — múltiples roles específicos por permiso
# Después — solo 2 roles
ROLES_ACTIVOS = (RolUsuario.ADMINISTRADOR, RolUsuario.VENDEDORA)

class PuedeGestionarPedidos(BasePermission):
    def has_permission(self, request, view):
        return request.user.rol in ROLES_ACTIVOS

class PuedeConfirmarPedido(BasePermission):
    def has_permission(self, request, view):
        return request.user.rol in ROLES_ACTIVOS

class PuedeTransicionarPedido(BasePermission):
    def has_permission(self, request, view):
        return request.user.rol in ROLES_ACTIVOS
```

El control fino de quién puede avanzar qué estado ya lo hace `TransicionesPedido.roles_permitidos`
en el service — no se duplica en los permisos de vista.

---

## Lo que se ELIMINA (anti-sobreingeniería)

| Elemento | Motivo |
|---|---|
| Roles `ALMACEN`, `TECNICO_TALLER`, `CONTABILIDAD`, `VENDEDOR_B2B` | No hay taller/almacén/contabilidad interno |
| Estado `ENVIADO` | Reemplazado por `ENTREGADO` |
| Estado `EN_TALLER` | Renombrado a `EN_LABORATORIO` |
| Estado `LISTO_PARA_DESPACHO` | Renombrado a `LISTO_PARA_ENTREGA` |
| `RecetaOptica.nombre_paciente` (texto libre) | Reemplazado por FK a `Paciente` |
| `OneToOne` receta → pedido | Reemplazado por FK 1:N |
| `fecha_vigencia` en `RecetaOptica` | No necesaria — el óptico edita la receta cuando vence |
| Lógica de roles múltiples en `TransicionesPedido` | Reducida a `ADMINISTRADOR` / `VENDEDORA` |

---

## Invariantes (No cambia nada de esto)

- Formato `PED-XXXXXX` y `ContadorPedido`
- `DetallePedido` → `VarianteProducto` (sin cambios)
- `StockService` — lógica de stock intacta
- `AuditoriaService` — intacto (solo se añaden nuevas acciones al enum)
- El flujo B2B completo (`ClienteOptica`) sigue funcionando
- Envelope de respuesta `{success, data, errors, message, meta}`
- Configuración JWT, settings, estructura de URLs base

---

## Orden de Implementación

```
Fase 1 ── choices.py + data migration roles
Fase 2 ── App pacientes (modelo + CRUD básico)
Fase 3 ── RecetaOptica refactorizada + data migration recetas huérfanas
Fase 4 ── Pedido refactorizado + data migration tipo_pedido + services + permissions
Fase 5 ── Finance extendido para pacientes
Fase 6 ── Limpieza de serializers y views
```

## Archivos Afectados

| Archivo | Cambio |
|---|---|
| `core/choices.py` | Modificar |
| `core/models.py` | Modificar (default rol) |
| `pacientes/` (directorio completo) | **Crear nuevo** |
| `orders/models.py` | Modificar (RecetaOptica + Pedido) |
| `orders/services.py` | Modificar |
| `orders/serializers/receta.py` | Modificar |
| `orders/serializers/pedido.py` | Modificar |
| `orders/permissions.py` | Simplificar |
| `finance/models.py` | Modificar |
| `finance/services.py` | Modificar |
| `config/settings.py` | Añadir app pacientes |
| `config/urls.py` | Añadir URLs pacientes |
| Data migrations | 3 migraciones de datos a crear |
