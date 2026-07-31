# Plan del Backend — OptiRosse

## Objetivo

Construir la API REST completa de OptiRosse trabajando **app por app**, de menor a mayor complejidad, siguiendo buenas prácticas para escalabilidad, modularidad y mantenimiento: capas (`models → serializers → views → services → urls`), envelope de respuesta uniforme, JWT con roles, permisos por rol y lógica de negocio desacoplada en servicios.

## Decisiones de arquitectura

- **Autenticación**: `djangorestframework-simplejwt` (access + refresh). `Usuario` custom como modelo auth, con claims extra: `rol`, `nombre`.
- **Formato de respuesta**: Envelope uniforme `{success, data, errors, message, meta}` vía renderer custom y exception handler de DRF.
- **Estilo de vistas**: combinación según la naturaleza del módulo:
  - **ViewSets + routers** para CRUDs simples (clients, inventory, recetas, métodos de pago).
  - **APIViews explícitas + services** para lógica compleja (auth, estados de pedido, pagos, generación de documentos).
- **Capas por app** (views delgadas, negocio en `services`).
- **URLs**: `/api/v1/<app>/...`; cada app con su `urls.py`, incluido en `backend/config/urls.py`.
- **Permisos**: por rol (`RolUsuario`), con clases base reutilizables.
- **Auditoría**: `RegistroAuditoria` se escribe vía `AuditoriaService` (o signals), nunca dentro de las views.
- **Dependencias nuevas**: `djangorestframework-simplejwt`. (Opcional al final: `drf-spectacular` para docs.)

## Convención de capas por app

```
backend/apps/<app>/
├── models.py
├── serializers/
│   ├── __init__.py
│   └── <modelo>.py
├── views/
│   ├── __init__.py
│   ├── <crud>.py          # ViewSets
│   └── <accion>.py        # APIViews para acciones de negocio
├── services.py            # lógica de negocio (PedidoService, PagoService, ...)
├── permissions.py         # permisos custom del app
├── filters.py             # filtros y búsquedas
├── urls.py                # router + endpoints custom
├── admin.py
└── apps.py
```

### Reuso compartido

Paquete `backend/common/api/` con la infraestructura que usan todas las apps:

- `response.py` — envelope + renderer.
- `exceptions.py` — formato unificado de errores (validación, negocio, no encontrado).
- `pagination.py` — paginación base.
- `viewsets.py` — `BaseModelViewSet`, `BaseReadOnlyModelViewSet`.
- `mixins.py` — mixin de auditoría.

## Orden por dificultad (grafo de dependencias)

```
core ──► clients ──► inventory ──► orders ──► finance
  │          │            │            │
  └──────────┴────────────┴────────────┴──► document_engine
```

- **core**: base (usuarios, auditoría, choices).
- **clients**: standalone, 1 modelo simple → CRUD más fácil.
- **inventory**: FK + filtros + stock.
- **orders**: negocio (totales, stock, máquina de estados).
- **finance**: consistencia contable transaccional → el más difícil.
- **document_engine**: render + integración cross-app.

---

## Fase 0 — Fundación del proyecto (pre-requisito)

Configurar la infraestructura que usan todas las apps.

- Instalar `djangorestframework-simplejwt`.
- Config en `backend/config/settings.py`:
  - `SIMPLE_JWT` (lifetime de access/refresh, algoritmo, claims custom).
  - `REST_FRAMEWORK` (authentication `JWTAuthentication`, renderer de envelope, paginación, `EXCEPTION_HANDLER` custom).
- Crear `backend/common/api/` con: `response.py`, `exceptions.py`, `pagination.py`, `viewsets.py`, `mixins.py`.
- Rutas base en `backend/config/urls.py`: `path('api/v1/', include(...))` por app.
- **Dificultad**: media.
- **Entregable**: convención de capas lista para consumir.

## Fase 1 — core (auth + usuarios) ✅ implementada

Modelos ya existen (`Usuario`, `RegistroAuditoria`). Detalle de implementación:

### Corrección previa (modelo, sin migración)
- `Usuario` no tenía `is_active`/`is_staff` → simplejwt (`default_user_authentication_rule`) accede a `user.is_active` y el login fallaría. Se añadieron **propiedades** (no campos):
  - `is_active` → `self.activo`
  - `is_staff` → `self.is_superuser or rol == RolUsuario.ADMINISTRADOR`
  - Bonus: arregla el login del admin de Django.

### Infra compartida (`backend/common/api/`)
- `tokens.py` → `TokenObtainPairSerializer` custom:
  - Campo `identificador` (nombre_usuario **o** correo, `__iexact`), maneja `DoesNotExist`/`MultipleObjectsReturned`.
  - `validate`: `authenticate(nombre_usuario, password)` + `USER_AUTHENTICATION_RULE` + `update_last_login`.
  - `get_token`: claims `rol` y `nombre` (nombre completo, fallback a `nombre_usuario`). Se conservan al refrescar (simplejwt copia claims del refresh al access).
- `permissions.py` → `es_rol(*roles)` (fábrica que devuelve una clase; compara `user.rol`) y `SoloLectura` (SAFE_METHODS).
- `mixins.py` → `_registrar_auditoria` implementado: lazy import de `AuditoriaService`, extrae user/IP de `self.request`, `tabla_afectada = instancia._meta.db_table`. Lo usan todos los ViewSets futuros.

### App core
- `services.py` → `AuthService`: `login`, `refresh`, `logout` (blacklist; `TokenError` → `ApiError` 400), `cambiar_contrasena` (valida `check_password`, validadores de Django y **revoca los refresh tokens** vía `OutstandingToken`), `me`. `AuditoriaService.registrar(...)`.
- `serializers/usuario.py` → `UsuarioSerializer`: password write_only, obligatoria en create, `validate_password`, `UniqueValidator` en `nombre_usuario`/`correo`, `set_password` en create/update.
- `views/auth.py`: APIViews explícitas (`login`, `refresh`, `logout`, `me`, `cambiar-contrasena`) — naturaleza no-CRUD; delegan en `AuthService`.
- `views/usuarios.py`: CRUD `Usuario` con `EsAdministrador`; `destroy` sobreescrito → **soft delete** (`activo=False`).
- `permissions.py`: `EsAdministrador = EsRol(RolUsuario.ADMINISTRADOR)`.
- `urls.py`: `SimpleRouter` → `usuarios/` + `auth/...`.

### Rutas
`/api/v1/auth/login|refresh|logout|me|cambiar-contrasena/`, `/api/v1/usuarios/`.
- **Dificultad**: media (autenticación + permisos), pero es la base de todo lo demás.
- **Done**: verificación por curl del flujo completo (login por identificador, claims, me, CRUD admin, 403 vendedor, refresh, logout, cambio de contraseña) y auditoría registrada.

## Fase 2 — clients (CRUD simple)

- `ClienteOptica` CRUD completo con `BaseModelViewSet`:
  - `serializers/cliente.py`, `filters.py` (búsqueda por razón social/RIF, filtro `activo`), paginación.
- `permissions.py`: lectura para cualquier rol autenticado; escritura para `ADMINISTRADOR`.
- Sin `services` (CRUD puro, sin reglas de negocio).
- **Dificultad**: baja.
- **Sirve como plantilla** para los CRUDs simples de inventario y métodos de pago.

## Fase 3 — inventory (FKs + filtros)

- `Categoria`: CRUD ViewSet simple (validación de unicidad tipo + nombre).
- `Producto`: CRUD ViewSet + filtros por categoría, marca, tipo.
- `VarianteProducto`: CRUD ViewSet con serializers anidados (crear variantes desde el producto), filtros por producto, alertas de stock (`stock <= alerta_stock_minimo`), búsqueda por SKU/código de barras.
- `services.py` → `StockService`: `validar_disponibilidad(variante, cantidad)` y `ajustar_stock(...)` — **base que usará orders en la Fase 4**.
- **Dificultad**: media. Primera app con relaciones FK y lógica de stock.

## Fase 4 — orders (negocio, nested writes, estados) ⭐ mayor salto de complejidad

- `RecetaOptica`: CRUD ViewSet simple.
- `Pedido`: **combina ViewSet con services** (aplicar la decisión de combinar técnicas):
  - Serializer principal con `DetallePedido` anidado (create/update nested dentro de `transaction.atomic()`).
  - `services.py` → `PedidoService`: genera `numero_pedido` secuencial, calcula `subtotal/impuesto/total`, valida y descuenta stock (usando `StockService`), y maneja transiciones de `EstadoPedido` (máquina de estados: `borrador → confirmado → en_taller → listo_para_despacho → enviado`, más `cancelado`).
  - Endpoints custom en `views/pedido.py`: `POST /pedidos/{id}/confirmar`, `POST /pedidos/{id}/cambiar-estado` (APIViews que delegan en `PedidoService`).
- **Dificultad**: alta. Aquí se justifica la capa `services` y el envelope (errores de negocio con códigos).

## Fase 5 — finance (consistencia transaccional) ⭐ el más difícil

- `MetodoPago`: CRUD ViewSet simple (usar la plantilla de clients).
- `Pago`: ViewSet + `services.py` → `PagoService`:
  - Registro de pago **y asiento de `LibroMayor` en la misma transacción** (nunca asientos sueltos).
  - Transición de estados `pendiente → aprobado/rechazado` con validaciones (monto vs saldo del pedido, referencia requerida si `MetodoPago.requiere_referencia`).
  - Recalcular `saldo_posterior` del cliente consultando el saldo previo.
- `LibroMayor`: **sin CRUD directo** — solo lectura (`BaseReadOnlyModelViewSet`) filtrado por cliente; los asientos los crea `PagoService` (y `PedidoService` en la Fase 4 si aplica).
- **Dificultad**: muy alta. Lógica contable + consistencia ACID.

## Fase 6 — document_engine (render + cross-app)

- `PlantillaDocumento`: CRUD ViewSet simple.
- `services.py` → `DocumentoService`: toma `PlantillaDocumento` + contexto (datos de `Pedido`, `Pago`, `ClienteOptica` según `TipoDocumento`), renderiza HTML/CSS y genera el documento (HTML en v1; PDF con weasyprint se evalúa después).
- Endpoint de generación: `POST /plantillas/{id}/generar` (APIView, delega en el servicio).
- **Dificultad**: alta por integración cross-app y renderizado.

## Fase 7 — Pulido transversal (opcional)

- Docs con `drf-spectacular` (`/api/docs`).
- Rate limiting.
- Optimización de queries (`select_related` / `prefetch_related`), revisión de N+1.
- `drf-nested-routers` si hace falta.

---

## Criterios de "done" por fase

- App registrada en `settings.INSTALLED_APPS` y URL incluida.
- Envelope correcto en respuestas y errores.
- Permisos por rol aplicados en todos los endpoints.
- Lógica de negocio dentro de `services`, views delgadas.
- `python manage.py check` y `makemigrations` sin cambios pendientes.
