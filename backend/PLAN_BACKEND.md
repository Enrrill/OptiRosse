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
- **Dependencias nuevas**: `djangorestframework-simplejwt`, `django-filter`. (Opcional al final: `drf-spectacular` para docs.)

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

## Fase 2 — clients (CRUD simple) ✅ implementada

Plantilla para los CRUDs simples (inventario, métodos de pago). Detalle:

### Infra compartida
- Dependencia `django-filter`: `DjangoFilterBackend` añadido a `REST_FRAMEWORK['DEFAULT_FILTER_BACKENDS']` (settings) y a `filter_backends` de `BaseModelViewSet`/`BaseReadOnlyModelViewSet` → todos los CRUD futuros filtran.
- `common/api/permissions.py` → nueva fábrica `es_rol_o_lectura(*roles)`: lectura para cualquier rol autenticado, escritura solo para los roles dados. (Reutilizada en inventario/finanzas.)

### App clients
- `serializers/cliente.py` → `ClienteOpticaSerializer`: `read_only_fields` de timestamps, `UniqueValidator` en `identificacion_fiscal` (mensaje en español), validación de no-negatividad en `limite_credito`/`dias_credito`.
- `filters.py` → `ClienteOpticaFilter(FilterSet)` con `activo` (`BooleanFilter`).
- `permissions.py` → `EscrituraAdministradorOLectura = es_rol_o_lectura(RolUsuario.ADMINISTRADOR)`.
- `views/cliente.py` → `ClienteOpticaViewSet(BaseModelViewSet)`:
  - `get_queryset`: en `list`, solo `activo=True` por defecto (salvo `?activo=false`); en detalle/update/delete queryset completo → permite reactivar inactivos.
  - `destroy` sobreescrito → **soft delete** (`activo=False`, auditoría `desactivar`), mismo patrón que `UsuarioViewSet`.
  - `search_fields`: razón social, nombre comercial, identificación fiscal, correo.
- `urls.py`: `SimpleRouter` → `/api/v1/clientes/`.

### Rutas
`/api/v1/clientes/` (CRUD completo; lista solo activos; `?activo=false`, `?search=`, `?ordering=`, `?page=`, `?page_size=`).
- **Dificultad**: baja.
- **Done**: verificación por curl (create/duplicado/validaciones 400, vendedor 403/lectura 200, sin token 401, soft delete + reactivación, filtro `activo`, search, auditoría `crear/actualizar/desactivar`) y `makemigrations` sin cambios (modelo intacto).

## Fase 3 — inventory (FKs + filtros) ✅ implementada

### Cambios de modelo (migración `0002`)
- `Categoria(ActivoMixin)` → `activo` + `UniqueConstraint(tipo_producto, nombre)`.
- `VarianteProducto(ActivoMixin)` → `activo` + `CheckConstraint` de no-negatividad en `stock`, `alerta_stock_minimo`, `precio_al_mayor`, `precio_costo`.
- `Categoria` **no** tiene timestamps: el viewset define `ordering = ('nombre',)` (el default `-creado_en` de la base fallaría). Sin `TimeStampedModel` deliberadamente.

### App inventory
- `serializers/`:
  - `categoria.py` → `CategoriaSerializer` (con `tipo_producto_display`) + `CategoriaResumenSerializer` para el detalle anidado en productos.
  - `variante.py` → `VarianteProductoSerializer` (standalone: `UniqueValidator` en SKU, `validate_codigo_barras` con exclusión de instancia) + `VarianteEnProductoSerializer` (anidado: **sin** validador de unicidad porque DRF lo auto-genera y rompe el update en listas anidadas; los checks de unicidad los hace `ProductoSerializer`). `id` escribible en el anidado para distinguir update/create.
  - `producto.py` → `ProductoSerializer` con `variantes` anidadas escribibles: `create`/`update` dentro de `transaction.atomic()`; update = upsert (items con `id` se actualizan, sin `id` se crean) y las **omitidas se desactivan** (`activo=False`); `validate` rechaza SKU/código de barras duplicados dentro del payload.
- `filters.py` → `CategoriaFilter`, `ProductoFilter` (`?categoria=`, `?tipo=` por `categoria__tipo_producto`, `?marca=` icontains), `VarianteProductoFilter` (`?producto=`, `?producto__categoria=`, `?stock_bajo=true` → `stock <= alerta_stock_minimo`).
- `permissions.py` → `EscrituraInventarioOLectura` y `EscrituraInventario` = `es_rol_o_lectura/es_rol(ADMINISTRADOR, ALMACEN)`.
- `services.py` → `StockService` (base para orders Fase 4):
  - `validar_disponibilidad(variante, cantidad)` → `ApiError(409, code='stock_insuficiente')`.
  - `ajustar_stock(variante, delta, motivo, usuario, direccion_ip)` → `transaction.atomic` + `select_for_update`, `update(stock=F('stock')+delta)` atómico y auditoría `ajuste_stock` con `{'delta', 'motivo'}`.
- `views/` → `CategoriaViewSet`, `ProductoViewSet` (queryset `select_related('categoria').prefetch_related('variantes')`), `VarianteProductoViewSet` (`select_related('producto', 'producto__categoria')`), `AjustarStockView` (APIView `POST /variantes/{id}/ajustar-stock/`). Los tres ViewSets sobrescriben `destroy` → **soft delete** y listan solo activos por defecto.

### Rutas
`/api/v1/categorias/`, `/api/v1/productos/`, `/api/v1/variantes/` (CRUD completo, soft delete, `?activo=`, search, paginación) + `POST /api/v1/variantes/{id}/ajustar-stock/`.
- **Dificultad**: media.
- **Done**: verificación por curl (create/duplicados 400, sku duplicado en payload, update anidado upsert + desactivación de omitidas, filtros `tipo/categoria/marca/producto/stock_bajo`, search, ajuste stock ± y 409 `stock_insuficiente`, permisos vendedor/almacén/sin token, soft deletes + reactivación, auditoría `crear/desactivar/ajuste_stock`), `check` y `makemigrations` sin pendientes.

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
