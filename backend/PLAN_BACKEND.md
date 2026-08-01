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

## Fase 4 — orders (negocio, nested writes, estados) ✅ implementada ⭐ mayor salto de complejidad

### Cambios de modelo (migración `0002`)
- `RecetaOptica(ActivoMixin)` → `activo` (soft delete).
- `Pedido`: `indexes = [Index(fields=['estado'])]`.
- `DetallePedido`: `CheckConstraint` `detalles_cantidad_positiva` (`cantidad >= 1`).
- Nuevo `ContadorPedido` (fila única pk=1, `ultimo_numero`) → numeración secuencial `PED-{n:06d}`.

### App orders
- `services.py` → `PedidoService`:
  - `_siguiente_numero()`: `select_for_update().get_or_create(pk=1)` dentro de `transaction.atomic()`.
  - `_calcular_totales()`: subtotal / impuesto (IVA `IMPUESTO_RATE = Decimal('0.16')` en settings) / total con `ROUND_HALF_UP`.
  - `crear` y `actualizar` (solo borrador; upsert de detalles con `id` escribible; re-cálculo de totales) dentro de `transaction.atomic()`.
  - `confirmar` (valida + descuenta stock vía `StockService` ordenando variantes por id), `cambiar_estado` (delega cancelación a `cancelar`), `cancelar` (restaura stock si fue descontado), `eliminar_borrador`.
  - Máquina de estados `TransicionesPedido`: `borrador → confirmado → en_taller → listo_para_despacho → enviado`, más `cancelado`; validación de transición y de rol por paso (403 `transicion_no_permitida`, 409 `transicion_invalida`); auditoría con `estado_anterior/estado_nuevo/motivo`.
- `serializers/`: `receta.py` (validación de rangos OD/OI), `detalle.py` (`DetalleEnPedidoSerializer` con `id` escribible y precio por defecto `variante.precio_al_mayor`), `pedido.py` (nested writable, read-only `numero_pedido/usuario/estado/subtotal/impuesto/total`, validaciones de variantes duplicadas y receta ya usada).
- `filters.py`: `RecetaOpticaFilter` (`activo`), `PedidoFilter` (`estado`, `cliente`, `usuario`, `numero_pedido`, `fecha_creado`).
- `permissions.py`: `EscrituraRecetaOLectura`, `EscrituraPedidoOLectura`, `PuedeConfirmarPedido`, `PuedeTransicionarPedido`.
- `views/`: `RecetaOpticaViewSet` (soft delete, lista solo activas), `PedidoViewSet` (`select_related` + `prefetch_related`, `update` limpia `_prefetched_objects_cache`, `destroy` delega en `eliminar_borrador`), `ConfirmarPedidoView` y `CambiarEstadoPedidoView` (APIViews → `PedidoService`).
- `urls.py`: router `recetas/` y `pedidos/` + `POST pedidos/{id}/confirmar/` y `POST pedidos/{id}/cambiar-estado/`.

### Rutas
`/api/v1/recetas/`, `/api/v1/pedidos/`, `POST /api/v1/pedidos/{id}/confirmar/`, `POST /api/v1/pedidos/{id}/cambiar-estado/`.
- **Dificultad**: alta. Aquí se justifica la capa `services` y el envelope (errores de negocio con códigos).
- **Done**: verificación E2E (44 checks: numeración secuencial, IVA 16%, upsert de detalles, stock descontado/restaurado, transiciones por rol con 403, 409 en transiciones inválidas/terminales, rollback ante `stock_insuficiente`, filtros, soft delete, auditoría) + `check` y `makemigrations` sin pendientes.

## Fase 5 — finance (consistencia transaccional) ✅ implementada ⭐ el más difícil

### Modelo contable (decisión: consistencia completa)
- El saldo del cliente (cuentas por cobrar) se deriva del **saldo corrido** del `LibroMayor` (`saldo_posterior` del último asiento por `-id`). `ClienteOptica` no guarda saldo.
- Asientos: **DEBITO** incrementa el saldo (venta) y **CREDITO** lo decrementa (pago o reverso). **DEBITO** y **CREDITO** con `saldo_posterior = saldo_previo ± monto`.
- `PedidoService.confirmar` crea asiento DEBITO por `pedido.total`; `PedidoService.cancelar` revierte ese asiento (CREDITO) vía `asiento_origen` (guarda anti-doble-reversión `asiento_ya_revertido`). El saldo queda neto consistente (pedido 100 con pago 40 cancelado → saldo −40 = crédito a favor).
- Los asientos se crean **siempre dentro de la misma transacción** que el evento de negocio (confirmar/cancelar/aprobar) — nunca asientos sueltos.

### Cambios de modelo (migración `0002`)
- `MetodoPago(ActivoMixin)` → `activo` (soft delete; `ordering=('nombre',)` en el viewset porque no tiene timestamps).
- `Pago`: + `motivo_rechazo`, `CheckConstraint` `pago_monto_positivo` (`monto > 0`) y `pago_tasa_cambio_positiva`, índice `pagos_idx_pedido_estado`.
- `LibroMayor`: + `asiento_origen` (FK a `self`, SET_NULL) + índice `libro_mayor_idx_cliente_creado`.

### App finance
- `services.py`:
  - `LibroMayorService` → `crear_asiento(...)` (lock del cliente con `select_for_update`, saldo previo, `saldo_posterior`, auditoría `asiento_libro_mayor`) y `revertir_asiento(...)` (tipo inverso + guarda `asiento_ya_revertido`).
  - `PagoService` → `crear` (PENDIENTE, sin asiento), `aprobar` (lock Pago → Pedido → Cliente en ese orden; valida estado PENDIENTE, `referencia_requerida` si `MetodoPago.requiere_referencia`, sobre-pago `sum(aprobados del pedido) + monto <= pedido.total` → `pago_excede_pedido`; crea asiento CREDITO y `estado = APROBADO` en la misma transacción; auditoría `aprobar_pago`) y `rechazar` (persiste `motivo_rechazo`, sin asiento, auditoría `rechazar_pago`).
  - Lock order consistente `Pedido/Pago → Cliente` para evitar deadlocks.
- `serializers/`: `metodo_pago.py`, `pago.py` (`PagoSerializer`: create vía `PagoService.crear`, read-only `estado`/timestamps, valida `cliente == pedido.cliente` o lo deriva, monto/tasa_cambio positivos, `fecha_pago` opcional con `default=timezone.now`; `PagoResumenSerializer` para anidados), `libro_mayor.py` (read-only con `cliente_detalle`, `pedido_numero`, `pago_detalle`, `tipo_asiento_display`, `asiento_origen_id`).
- `filters.py`: `MetodoPagoFilter` (`activo`, `moneda`), `PagoFilter` (`estado`, `cliente`, `pedido`, `metodo_pago`, `fecha_pago`), `LibroMayorFilter` (`cliente`, `tipo_asiento`, `fecha_creado`).
- `permissions.py`: `EscrituraMetodoPagoOLectura = es_rol_o_lectura(ADMINISTRADOR, CONTABILIDAD)`, `GestionPago = es_rol(ADMINISTRADOR, CONTABILIDAD)`, `LecturaLibroMayor = es_rol(ADMINISTRADOR, CONTABILIDAD)`.
- `views/`: `MetodoPagoViewSet` (soft delete, lista solo activos), `PagoViewSet` (create/list/retrieve; `update`/`partial_update`/`destroy` sobreescritos → 409 `pago_no_editable`/`pago_no_eliminable`), `AprobarPagoView` y `RechazarPagoView` (APIViews → `PagoService`), `LibroMayorViewSet` (`BaseReadOnlyModelViewSet`).
- `urls.py`: router `metodos-pago/`, `pagos/`, `libro-mayor/` + `POST pagos/{id}/aprobar/` y `POST pagos/{id}/rechazar/`.

### Rutas
`/api/v1/metodos-pago/`, `/api/v1/pagos/`, `POST /api/v1/pagos/{id}/aprobar/`, `POST /api/v1/pagos/{id}/rechazar/`, `/api/v1/libro-mayor/`.
- **Dificultad**: muy alta. Lógica contable + consistencia ACID (saldo corrido con lock, validaciones de referencia y sobre-pago, transiciones de pago, reversos de asiento).
- **Done**: verificación E2E (crear pago pendiente sin asiento, aprobar → asiento CREDITO con `saldo_posterior` correcto, rechazar con `motivo_rechazo` y sin asiento, 409 `referencia_requerida`/`pago_excede_pedido`/`pago_estado_invalido`/`pago_no_editable`/`pago_no_eliminable`, confirmar pedido → asiento DEBITO, cancelar → reverso con `asiento_origen`, `libro-mayor` solo lectura con 403 a vendedor, soft delete de métodos, permisos y auditoría) + `check` y `makemigrations` sin pendientes.

## Fase 6 — document_engine (render + cross-app) ✅ implementada

Decisión de motor PDF: **WeasyPrint (backend)**. Las plantillas viven en BD como HTML+CSS (`PlantillaDocumento.contenido_html` + `estilos_css`) y WeasyPrint las convierte a PDF con soporte completo de CSS de impresión (`@page`, numeración, saltos de página). El frontend solo descarga el documento generado. Alternativa documentada: `xhtml2pdf` (pura-Python sin deps de sistema, CSS pobre) como fallback si no se pueden instalar librerías del sistema.

### Dependencia nueva
- `weasyprint==69.0` (compatible Python 3.12) en `requirements.txt`. Requiere librerías de sistema: pango, cairo, harfbuzz, gdk-pixbuf, libffi (presentes en el entorno dev).
- `PlantillaDocumento` **no requiere migración** — el modelo ya existía desde `0001_initial` (se creó como base de la fase y quedó intacto).

### App document_engine
- `services.py` → `DocumentoService`:
  - `_contexto_pedido` / `_contexto_pago`: construyen el contexto de la plantilla con **solo primitivas/serializados** (nunca objetos ORM) usando `select_related` por modelo (`Pedido`→`cliente/usuario/receta`, `Pago`→`cliente/pedido/metodo_pago`). `FACTURA`/`NOTA_ENTREGA`/`ORDEN_TRABAJO` consumen `Pedido` (cliente, detalles con variante+producto, subtotal/impuesto/total, receta OD/OI); `RECIBO_PAGO` consume `Pago` (cliente, método, monto, tasa, referencia, pedido asociado).
  - `_renderizar_html`: motor de templates de Django; inyecta `estilos_css` dentro de `<style>`; contexto solo primitivas → las plantillas solo leen lo expuesto (seguridad). `TemplateSyntaxError` → `ApiError` 400 `plantilla_invalida`.
  - `_renderizar_pdf`: `weasyprint.HTML(string=html).write_pdf()`; errores de la librería → `ApiError` 400 `documento_render_invalido`.
  - `generar(...)`: resuelve el objeto según `tipo_documento` (404 `objeto_no_encontrado`), renderiza, convierte si `formato=pdf`, auditoría `generar_documento` con `{tipo_documento, formato, objeto, nombre_archivo}`; devuelve `DocumentoGenerado` (dataclass con `contenido`, `nombre_archivo`, `content_type`).
- `serializers/plantilla.py` → `PlantillaDocumentoSerializer` (read-only `actualizado_en`, `tipo_documento_display`, validación de `contenido_html` no vacío) + `GenerarDocumentoSerializer` (`objeto_id` int obligatorio, `formato` `html|pdf` default `html`).
- `filters.py` → `PlantillaDocumentoFilter` (`activo`, `tipo_documento`).
- `permissions.py` → `EscrituraPlantillaOLectura = es_rol_o_lectura(ADMINISTRADOR)`, `PuedeGenerarDocumento = es_rol(ADMINISTRADOR, CONTABILIDAD, VENDEDOR_B2B)`.
- `views/plantilla.py` → `PlantillaDocumentoViewSet(BaseModelViewSet)` (soft delete `desactivar`, lista solo activas por defecto, `ordering=('tipo_documento',)`, `search_fields=('nombre',)`).
- `views/generar.py` → `GenerarDocumentoView` (APIView `POST`): valida plantilla activa (409 `plantilla_inactiva`), delega en `DocumentoService.generar` y responde el **archivo binario** (`Content-Disposition: attachment; filename=...`, `application/pdf` o `text/html`) — excepción deliberada al envelope JSON (es un binario, no JSON).
- `urls.py`: router `plantillas/` + `POST plantillas/{pk}/generar/`. Include en `config/urls.py`.

### Rutas
`/api/v1/plantillas/` (CRUD, soft delete, `?activo=`, search), `POST /api/v1/plantillas/{id}/generar/` (body `{objeto_id, formato}`).
- **Dificultad**: alta (integración cross-app, seguridad de plantillas, respuesta binaria fuera del envelope).
- **Done**: verificación E2E (CRUD + soft delete de plantilla con admin, vendedor lee/403 escribe, generar HTML factura con contexto completo, generar PDF con content-type y bytes válidos, orden de trabajo con receta, recibo de pago, 404 plantilla/objeto, plantilla con error de sintaxis → 400, auditoría `generar_documento`) + `check` y `makemigrations` sin pendientes.

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
