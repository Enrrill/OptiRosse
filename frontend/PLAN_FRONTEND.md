# Plan del Frontend — OptiRosse

Diseño de UI por módulo (aprovechando al máximo la API de `backend/PLAN_BACKEND.md`) + prompts listos para **Google Stitch** (https://stitch.withgoogle.com).

Flujo de trabajo: se genera el diseño de cada módulo en Stitch con su prompt → se me pasa el resultado → yo implemento el frontend (React 19 + Vite 8 + **TypeScript** + Tailwind v4 + **shadcn/ui** con tokens **Material 3**).

**Dependencias** (verificadas en npm): `react-router` 8 · `@tanstack/react-query` 5 · `axios` 1 · `react-hook-form` 7 + `zod` 4 (+ `@hookform/resolvers` 5) · `zustand` 5 · `material-symbols` · `sonner` · `dayjs` · fuentes `@fontsource` (Manrope/Inter/JetBrains Mono) · primitivas `@radix-ui/*` (vía shadcn). Dev: `typescript`, `vite-tsconfig-paths`, `typescript-eslint`. Proxy de Vite `/api` → backend `:8000`.

---

## Contrato con el backend (contexto obligatorio para todo diseño)

### Envelope de respuesta
Toda respuesta JSON del API usa el envelope:
```json
{
  "success": true,
  "data": [ ... ],
  "errors": null,
  "message": "Creado correctamente",
  "meta": { "count": 42, "next": null, "previous": null }
}
```
- **Listas**: `data` es el array de resultados; paginación en `meta` (`count`, `next`, `previous`). Query params: `?page=1&page_size=20` (máx 100, default 20).
- **Detalle/creación/actualización**: `data` es el objeto.
- **Errores 4xx/5xx**: `success:false`, `data:null`, `errors` es **objeto `{campo: [mensajes]}`** (validaciones) o **array `[{code, detail}]`** (errores de negocio), `message` es el mensaje legible.
- **Excepción**: `POST /api/v1/plantillas/{id}/generar/` responde un **archivo binario** (PDF/HTML) con `Content-Disposition: attachment` — no usa envelope.

### Búsqueda, filtros y ordenamiento (django-filter + DRF)
- `?search=<texto>` busca en los campos de búsqueda de cada módulo.
- `?ordering=<campo>` o `?ordering=-<campo>`.
- Filtros específicos por módulo (documentados abajo).
- **Soft delete**: los módulos `activo` no se borran físicamente; por defecto las listas solo muestran `activo=true`, se incluyen con `?activo=false` (o `?activo=all` no existe → usar `?activo=false` para ver inactivos).

### Autenticación (JWT — access 30 min, refresh 1 día)
| Endpoint | Método | Body / respuesta |
|---|---|---|
| `/api/v1/auth/login/` | POST | `{identificador, password}` → `{access, refresh}` (identificador = nombre_usuario **o** correo) |
| `/api/v1/auth/refresh/` | POST | `{refresh}` → `{access}` |
| `/api/v1/auth/logout/` | POST | `{refresh}` (blacklist) |
| `/api/v1/auth/me/` | GET | datos del usuario actual |
| `/api/v1/auth/cambiar-contrasena/` | POST | `{contrasena_actual, contrasena_nueva}` |

- Header: `Authorization: Bearer <access>`.
- El frontend debe **refrescar el access token automáticamente** (interceptar 401 → `refresh` → reintentar; si refresh falla → logout).
- **No hay registro público**: el alta de usuarios la hace un administrador en `/api/v1/usuarios/`. La pantalla de "registro" del diseño es el **formulario de alta de usuarios (admin)**.

### Roles y mapa de permisos
| Rol | Acceso destacado |
|---|---|
| `administrador` | Todo: usuarios, clientes, inventario, recetas, pedidos, finanzas, plantillas (escritura). |
| `vendedor_b2b` | Clientes/inventario (lectura), recetas y pedidos (crear/editar/confirmar), generar documentos, pagos no. |
| `almacen` | Inventario (escritura), pedidos (transición a enviado), resto lectura. |
| `tecnico_taller` | Recetas (escritura), pedidos (transiciones taller), resto lectura. |
| `contabilidad` | Métodos de pago y pagos (gestión), libro mayor, generar documentos. |

Regla general: **lectura para todos los roles autenticados, escritura solo para los roles permitidos**. Los botones de acción se muestran/ocultan según el rol del usuario (`auth/me` → `rol`).

### Estados y códigos de negocio relevantes
- **Pedido**: `borrador → confirmado → en_taller → listo_para_despacho → enviado`, más `cancelado`. Errores: `transicion_invalida` (409), `transicion_no_permitida` (403), `pedido_no_editable`/`pedido_no_eliminable` (409), `stock_insuficiente` (409).
- **Pago**: `pendiente → aprobado | rechazado`. Errores: `pago_estado_invalido` (409), `referencia_requerida` (409), `pago_excede_pedido` (409), `pago_no_editable`/`pago_no_eliminable` (409).
- **Documento**: `plantilla_invalida` (400), `documento_render_invalido` (400), `objeto_no_encontrado` (404), `plantilla_inactiva` (409).
- **Auth**: `token_invalido` (401), `contrasena_incorrecta` (400).
- **Libro mayor**: `asiento_ya_revertido` (409).
- **Inventario**: `stock_insuficiente` (409, en ajustar stock negativo).

### Reglas de negocio que el UI debe reflejar
- **IVA 16%** aplicado automáticamente a los pedidos (`subtotal * 0.16`). El frontend NO calcula: los totales los devuelve el backend (`subtotal`, `impuesto`, `total`) pero debe mostrar el detalle.
- Pedido en `borrador` es el único editable/eliminable. Al **confirmar** se descuenta stock y se crea asiento débito.
- Un **pago pendiente** no genera asiento; al **aprobar** sí (crédito). Rechazar requiere `motivo_rechazo`.
- Los **detalles anidados** (variantes en producto, detalles en pedido) se envían en el mismo payload del PUT/POST; los omitidos en update se eliminan/desactivan.

---

## Sistema de diseño (base de TODOS los módulos) — tokens Material 3

Adoptado de los prototipos en `Ejemplos/`. Se aplica en cada prompt de Stitch y en el código (definido con `@theme` de Tailwind v4 en `src/index.css`).

### Paleta (Material 3 sobre colores del logo OptiRosse)
- **Primario / roles de color**:
  - `primary` `#5300B7` · `on-primary` `#FFFFFF` · `primary-container` `#6D28D9` (morado del logo) · `on-primary-container` `#DAC5FF`.
  - `secondary-container` `#40C2FD` (azul del logo, ~#38BDF8) · `secondary` `#00668A` · `on-secondary-container` `#004D6A`.
  - `tertiary-container` `#9C2A6C` · `tertiary` `#7E0B54`.
- **Superficies (neutros claro)**:
  - `background`/`surface` `#F8F9FF` · `surface-bright` `#F8F9FF` · `surface-container-lowest` `#FFFFFF` · `surface-container-low` `#EFF4FF` · `surface-container` `#E5EEFF` · `surface-container-high` `#DCE9FF` · `surface-container-highest` `#D3E4FE`.
  - `on-surface` `#0B1C30` · `on-surface-variant` `#4A4455` · `outline` `#7B7486` · `outline-variant` `#CCC3D7`.
- **Superficies (oscuro)**: los ejemplos mapean `inverse-surface` `#213145`, `inverse-on-surface` `#EAF1FF`, `primary-fixed-dim` `#D3BBFF`, `surface-variant`, `surface-container-highest` como fondos/superficies del tema oscuro. El toggle `.dark` en `<html>` alterna los tokens vía CSS variables.
- **Semánticos**: `error` `#BA1A1A` · `error-container` `#FFDAD6` · `on-error-container` `#93000A` · éxito/advertencia/info usan `secondary-container`/`tertiary`/`error` y variantes `*-fixed`.
- Soporte **claro y oscuro con toggle** (persistir en localStorage; respetar `prefers-color-scheme` al primer arranque).

### Tipografía y geometría
- **Manrope** (display/headings, 600/700/800), **Inter** (body, 400/500), **JetBrains Mono** (labels `label-sm`, códigos, mono) — self-hosted con `@fontsource` (sin CDN en runtime).
- **Iconos**: Material Symbols Outlined (`material-symbols` npm), componente `<Icon name="...">` con eje `FILL`.
- Radios: `rounded-lg` (tarjetas/tablas) y `rounded-xl` (paneles grandes), `rounded-full` (badges/avatares/píldoras).
- Escala de espaciado (de los ejemplos): `xs` 4px · `sm` 12px · `base` 8px · `md`/`gutter` 24px · `lg` 48px · `xl` 80px · `margin-mobile` 16px · `margin-desktop` 64px.
- Densidad media (B2B): tablas compactas, 40px de alto en inputs/botones estándar.

### Patrones transversales (componentes reutilizables)
- **AppShell**: sidebar izquierda fija (`w-64`, colapsable a 72px con tooltips) + topbar `h-16` sticky con blur (`backdrop-blur`) + área de contenido (`ml-* pt-16`).
- **Tablas de listado** (`DataTable` genérico): card con thead `surface-container-low` (labels en `label-sm` uppercase tracking-wider), filas con hover, **toolbar de filtros + buscador + paginación**, badge de estado, acciones por fila (iconos).
- **Badges de estado** con colores semánticos (mapa central en `lib/constants/choices.ts`).
- **Formularios**: en **drawer derecho** (`max-w-xl`, cabecera/acciones sticky, secciones con encabezado de icono) o página según módulo; labels arriba; validación en campo (rojo + mensaje); **errores del envelope mapeados a cada campo** (`setError`); botones Guardar/Cancelar.
- **Modales de confirmación** para acciones destructivas (desactivar, cancelar pedido, rechazar pago): overlay con `backdrop-blur`, ícono de alerta en círculo `error-container`, animación scale/opacity.
- **Toasts** (sonner) para `message` de éxito/error.
- **Estados**: loading (spinner/skeleton), empty (ícono + "No hay resultados" + acción), error (mensaje + reintentar).
- **Cambiar contraseña / logout** siempre accesibles (menú de usuario en la topbar).

---

## Arquitectura del frontend

**Stack**: React 19 + Vite 8 + TypeScript + Tailwind v4 + shadcn/ui (Radix) + TanStack Query + Zustand + react-hook-form/zod + axios.

### Estructura de carpetas (features/modular)

```
src/
  main.tsx                  # bootstrap: providers + router
  index.css                 # @theme tokens Material 3 + @custom-variant dark + vars shadcn
  app/
    router.tsx              # createBrowserRouter con rutas lazy
    providers.tsx           # QueryClientProvider + ThemeProvider + AuthProvider + Toaster
  lib/
    utils.ts                # cn() (clsx + tailwind-merge)
    api/
      client.ts             # axios: baseURL /api/v1, Bearer, 401→refresh→retry, unwrap envelope
      endpoints.ts          # rutas centralizadas por recurso/acción
      errors.ts             # ApiError { message, errors, status, code }
    format.ts               # moneda (Intl), fechas (dayjs es), porcentajes
    constants/
      choices.ts            # roles/estados/tipos → { label, badgeClass }
      nav.ts                # items de navegación por rol
      query.ts              # defaults de react-query (staleTime, retry, keepPreviousData)
  store/
    useAuth.ts              # zustand persist: user, tokens, login/logout/refresh
    useUI.ts                # zustand: sidebar colapsada, tema
    useToast.ts             # envoltura de sonner
  components/
    layout/                 # AppShell, Sidebar, Topbar, UserMenu
    data/                   # DataTable, Pagination, StatusBadge, EmptyState, SkeletonRows, PageHeader
    forms/                  # FieldError, SectionCard, MoneyInput
    ui/                     # primitivas shadcn (Button, Input, Dialog, Drawer, Select, Tabs, Switch, DropdownMenu, Tooltip, Popover, Checkbox, Label, Textarea, Badge)
  hooks/
    useApi.ts               # useApiQuery / useApiMutation (react-query + ApiError)
    usePagination.ts
    useDebounce.ts
  features/                 # UNA carpeta por módulo (página + subcomponentes locales)
    auth/ dashboard/ users/ clients/ inventory/ prescriptions/
    orders/ finance/ documents/ profile/ errors/
  types/
    api.ts                  # Envelope<T>, Paginated<T>
    models.ts               # interfaces por entidad
```

**Reglas de composición**:
- `features/` solo importa de `lib/`, `store/`, `components/`, `hooks/` y `types/`. **Un feature nunca importa de otro feature**.
- Los componentes compartidos viven en `components/`; los datos/constantes de negocio en `lib/`; el estado global en `store/`.
- Cada módulo expone página(s) + sus subcomponentes locales en su propia carpeta (evita duplicidad y facilita escalar).

### Infraestructura clave (anti-duplicación)
- **`lib/api/client.ts`**: instancia axios con `baseURL=/api/v1`; request interceptor añade `Authorization: Bearer <access>`; response interceptor **desenvuelve el envelope** → devuelve `{ data, meta, message }` o lanza `ApiError`; en `401` → `auth/refresh` → reintenta (si falla → logout); para generar documento usa `responseType:'blob'` (excepción binaria al envelope).
- **`lib/api/errors.ts`**: `ApiError` con `{ message, errors, status, code }`; helper que normaliza `errors` (objeto `{campo:[msgs]}` o array `[{code, detail}]`) para mapeo a campos y toast.
- **`hooks/useApi.ts`**: `useApiQuery`/`useApiMutation` sobre react-query con defaults de `lib/constants/query.ts` (staleTime, retry, `placeholderData: keepPreviousData` para paginación) → las páginas no repiten configuración.
- **`components/data/DataTable.tsx`**: tabla genérica por configuración de columnas + estado loading/empty/error + orden + paginación → evita repetir markup de tabla en los 8 módulos.
- **`lib/constants/choices.ts`**: mapas centralizados `rol/estado/tipo → { label, badgeClass }` (badges nunca duplicados).
- **Formularios**: RHF + zod; helper que mapea `errors` del envelope a `setError` por campo; `FieldError` muestra el mensaje bajo el input.
- **Auth**: store zustand con persistencia en localStorage (access/refresh/user), `login`, `logout`, refresh automático; rutas protegidas (`ProtectedRoute`) y por rol (`RoleRoute`).

---

## Módulos (uno por sección; cada uno con prompt para Stitch)

---

## 1. Login

**Pantallas**: 1 (login).

**Backend**: `POST /api/v1/auth/login/` con `{identificador, password}`. Errores: 401 credenciales inválidas.

**Especificación visual**:
- Página centrada, fondo con degradado sutil morado→azul claro, card blanca con sombra.
- Logo OptiRosse arriba, título "Iniciar sesión", subtítulo "Óptica B2B — plataforma de gestión".
- Campo **usuario o correo** (placeholder "usuario@empresa.com o nombre de usuario"), campo **contraseña** (con ojo para mostrar/ocultar).
- Botón primario ancho "Iniciar sesión" (morado), estado loading con spinner.
- Error global en rojo bajo el botón ("No existe una cuenta activa con estas credenciales").
- Enlace "¿Olvidaste tu contraseña?" → modal que indica contactar al administrador (no hay endpoint de reset).
- Footer con copyright.
- Tras éxito → redirige al dashboard según rol.

### Prompt para Stitch
> Diseña la página de inicio de sesión de una plataforma web B2B para una óptica, en español, estilo moderno y corporativo. Colores: morado #6D28D9 como primario y azul claro #38BDF8 como acento, con soporte para tema claro y oscuro. Layout: fondo con un degradado suave que combina morado y azul claro, una tarjeta centrada de color blanco con sombra suave y esquinas redondeadas. En la parte superior de la tarjeta, un logo de gafas/óptica y el nombre "OptiRosse". Debajo el título "Iniciar sesión" y un subtítulo "Óptica B2B — plataforma de gestión". Campos de formulario apilados con etiqueta arriba: "Usuario o correo electrónico" y "Contraseña" (con un icono de ojo para mostrar/ocultar la contraseña). Un botón ancho de color morado con el texto "Iniciar sesión". Debajo, un mensaje de error en rojo y un enlace "¿Olvidaste tu contraseña?". Al pie de la página el texto de copyright. Incluye el estado de carga (spinner en el botón) y el estado con error de autenticación visible.

---

## 2. Layout principal (App Shell)

**Pantallas**: shell que envuelve todos los módulos autenticados.

**Backend**: `GET /api/v1/auth/me/` (rol, nombre, correo).

**Especificación visual**:
- **Sidebar** izquierda fija (colapsable en tablet, drawer en móvil) con: logo, secciones según rol (Dashboard, Clientes, Inventario, Recetas, Pedidos, Finanzas, Documentos, Usuarios [admin]), item activo resaltado en morado, versión al pie.
- **Topbar**: breadcrumb/título de sección, buscador global (según módulo), toggle claro/oscuro, avatar + menú desplegable (Perfil, Cambiar contraseña, Cerrar sesión).
- **Contenido**: área scrollable con padding, `max-w` amplio.

### Prompt para Stitch
> Diseña el layout principal (app shell) de una aplicación web B2B de gestión para una óptica, en español, estilo moderno corporativo. Colores: morado #6D28D9 primario y azul claro #38BDF8 acento, temas claro y oscuro con un toggle en la barra superior. Estructura: una barra lateral izquierda fija con el logo "OptiRosse", menú de navegación con iconos y texto: Dashboard, Clientes, Inventario, Recetas, Pedidos, Finanzas, Documentos, y Usuarios (este último con un candado o etiqueta "admin"). El item activo resaltado con fondo morado suave. Al pie de la barra lateral el nombre de la app y versión. En la parte superior una barra con el título de la sección actual, un campo de búsqueda, el toggle de tema claro/oscuro, y un avatar de usuario con menú desplegable (Perfil, Cambiar contraseña, Cerrar sesión). El área central con fondo gris claro en tema claro y fondo oscuro en tema oscuro, lista para contenido. Muestra también el estado colapsado de la barra lateral (solo iconos).

---

## 3. Dashboard / Índice

**Pantallas**: 1 (resumen por rol).

**Backend**: listas existentes (para KPIs):
- Pedidos: `/api/v1/pedidos/?estado=...&page_size=1` (usa `meta.count` por estado).
- Variantes con stock bajo: `/api/v1/variantes/?stock_bajo=true&page_size=1`.
- Pagos pendientes: `/api/v1/pagos/?estado=pendiente&page_size=1`.
- Libro mayor (admin/contabilidad): `/api/v1/libro-mayor/?cliente=X`.

**Especificación visual**:
- Grid de **tarjetas KPI** por rol:
  - Vendedor/Admin: pedidos por estado (conteos), total vendido del mes (suma de `total`), clientes.
  - Almacén: variantes con **stock bajo** (tarjeta de alerta roja/ámbar con enlace al inventario).
  - Contabilidad: pagos pendientes de aprobación, saldo total por cobrar (últimos `saldo_posterior` por cliente).
- **Accesos rápidos**: botones "Nuevo pedido", "Registrar pago", "Nueva variante".
- **Reciente**: tabla con los últimos pedidos (`/api/v1/pedidos/` ordenado por `-creado_en`) y últimos pagos.
- Toast de bienvenida con el nombre del usuario.

### Prompt para Stitch
> Diseña el panel principal (dashboard) de una aplicación web B2B para una óptica, en español, estilo moderno corporativo con colores morado #6D28D9 y azul claro #38BDF8, temas claro y oscuro. Utiliza el layout de app shell con barra lateral izquierda y barra superior. El contenido es una grilla de tarjetas con indicadores (KPIs): una tarjeta morada "Pedidos confirmados" con un número grande, una tarjeta azul "En taller", una tarjeta con icono de alerta en ámbar "Stock bajo" que muestra un número y un enlace "Ver inventario", y una tarjeta verde "Pagos pendientes". Debajo, una fila de accesos rápidos con botones: "Nuevo pedido", "Registrar pago", "Nueva variante". Luego dos secciones lado a lado: "Últimos pedidos" como tabla compacta con columnas N.º pedido, cliente, estado (badge de color) y total, y "Últimos pagos" con cliente, monto y estado. Incluye un toast de bienvenida en la esquina superior derecha saludando al usuario.

---

## 4. Usuarios (admin)

**Pantallas**: lista + formulario (crear/editar).

**Backend**:
- `GET/POST /api/v1/usuarios/`, `GET/PUT/PATCH/DELETE /api/v1/usuarios/{id}/` (solo admin; soft delete con `activo=false`).
- Campos: `nombre_usuario`, `correo`, `nombre`, `apellido`, `rol` (administrador|vendedor_b2b|almacen|tecnico_taller|contabilidad), `telefono`, `activo`, `password` (write-only), timestamps.

**Especificación visual**:
- Tabla: usuario, nombre completo, correo, rol (badge), estado activo/inactivo (toggle/badge), creado_en; acciones: editar, desactivar/reactivar.
- Filtros: búsqueda por nombre/usuario/correo; selector de rol.
- **Formulario**: campos arriba; rol como `<select>` con etiquetas en español; contraseña solo en creación (opcional en edición para reset); validaciones del servidor mapeadas (`nombre_usuario`/`correo` duplicados).
- Modal de confirmación al desactivar.

### Prompt para Stitch
> Diseña el módulo de gestión de usuarios de una aplicación web B2B de óptica, en español, estilo moderno corporativo, colores morado #6D28D9 y azul claro #38BDF8, temas claro y oscuro. Vista de lista: tabla con columnas "Usuario", "Nombre completo", "Correo", "Rol" (como badge de color: Administrador morado, Vendedor B2B azul, Almacén gris, Técnico de Taller naranja, Contabilidad verde), "Estado" (activo/inactivo) y "Creado". Barra superior con buscador, filtro de rol y botón morado "Nuevo usuario". Acciones por fila: editar y desactivar (iconos). Vista de formulario: los campos Usuario, Nombre, Apellido, Correo, Teléfono, Rol (lista desplegable) y Contraseña (solo al crear, con indicación "solo se muestra al crear"), con botones "Guardar" y "Cancelar". Incluye un modal de confirmación "¿Desactivar este usuario?" y estados de error de validación en rojo bajo cada campo.

---

## 5. Clientes

**Pantallas**: lista + detalle + formulario (crear/editar).

**Backend**:
- `GET/POST /api/v1/clientes/`, `GET/PUT/PATCH/DELETE /api/v1/clientes/{id}/` (escritura admin; lectura todos).
- Búsqueda: `?search=` sobre `razon_social`, `nombre_comercial`, `identificacion_fiscal`, `correo`. Filtro `?activo=`.
- Campos: `razon_social`, `nombre_comercial`, `identificacion_fiscal`, `correo`, `telefono`, `direccion`, `limite_credito`, `dias_credito`, `activo`, timestamps.

**Especificación visual**:
- Tabla: nombre comercial, razón social, RIF/identificación, correo, teléfono, límite de crédito (moneda), días de crédito; acciones ver/editar/desactivar.
- **Detalle**: cabecera con nombre comercial + estado; datos de contacto en grid; tarjeta de **crédito** (límite, días, saldo por cobrar si el rol puede ver libro mayor); botones "Nuevo pedido", "Registrar pago" (según rol).
- **Formulario**: todos los campos; validación de `identificacion_fiscal` duplicado; `limite_credito`/`dias_credito` ≥ 0.

### Prompt para Stitch
> Diseña el módulo de clientes de una aplicación web B2B de óptica, en español, estilo moderno corporativo, colores morado #6D28D9 y azul claro #38BDF8, temas claro y oscuro. Vista de lista: tabla con columnas "Nombre comercial", "Razón social", "Identificación fiscal (RIF)", "Correo", "Teléfono", "Límite de crédito" (formato moneda) y "Días de crédito"; buscador arriba y botón "Nuevo cliente"; acciones por fila ver/editar/desactivar. Vista de detalle: cabecera con el nombre comercial, badge de estado y botones "Nuevo pedido" y "Registrar pago"; debajo tarjetas con datos de contacto (correo, teléfono, dirección) y una tarjeta de crédito que muestra límite de crédito, días de crédito y saldo por cobrar. Vista de formulario con los campos Razón social, Nombre comercial, Identificación fiscal, Correo, Teléfono, Dirección (textarea), Límite de crédito y Días de crédito, con validación en rojo y botones Guardar/Cancelar. Incluye estados de carga, vacío y un modal de confirmación de desactivación.

---

## 6. Inventario (Categorías + Productos + Variantes/Stock)

**Pantallas**: lista de categorías · lista de productos · formulario producto (con variantes) · lista de variantes · modal ajustar stock.

**Backend**:
- `/api/v1/categorias/` CRUD (escritura admin+almacén). Campos: `nombre`, `tipo_producto` (montura|cristal_terminado|bloque_tallado|accesorio), `activo`.
- `/api/v1/productos/` CRUD. Campos: `categoria`, `marca`, `codigo_modelo`, `descripcion`, `indice_refraccion`, `material`, `tratamiento`, `diseno`, `variantes[]` (anidadas). Filtros: `?categoria=`, `?tipo=`, `?marca=`, `?activo=`; search.
- `/api/v1/variantes/` CRUD + `POST /api/v1/variantes/{id}/ajustar-stock/` `{cantidad, motivo}`. Campos: `producto`, `sku`, `codigo_barras`, `color`, `tamano`, `esfera`, `cilindro`, `eje`, `adicion`, `stock`, `alerta_stock_minimo`, `precio_al_mayor`, `precio_costo`, `activo`. Filtro clave: **`?stock_bajo=true`** (stock ≤ alerta).
- Errores: `stock_insuficiente` (409).

**Especificación visual**:
- **Categorías**: tabla sencilla (nombre, tipo badge, estado), CRUD en modal o panel.
- **Productos**: tabla (marca, código/modelo, categoría, tipo, variantes), filtros de tipo/categoría/marca + buscador; botón "Nuevo producto".
- **Formulario producto**: datos del producto + **sección de variantes** como tabla editable (agregar/quitar filas): SKU, código barras, color, tamaño, esfera, cilindro, eje, adición, stock, alerta, precio al mayor, precio costo. Se envía todo junto (upsert: las filas existentes con `id`, las nuevas sin él; las omitidas se desactivan).
- **Variantes**: tabla con stock (coloreado: rojo si `stock=0`, ámbar si `stock<=alerta_stock_minimo`), precio mayor/costo, gradiente óptico (esfera/cilindro/eje); filtro **toggle "Solo stock bajo"**; botón "Ajustar stock" por fila.
- **Modal ajustar stock**: campo cantidad (+/−), motivo (obligatorio si negativo), preview del stock resultante, feedback de `stock_insuficiente`.

### Prompt para Stitch
> Diseña el módulo de inventario de una aplicación web B2B de óptica, en español, estilo moderno corporativo, colores morado #6D28D9 y azul claro #38BDF8, temas claro y oscuro. Vista de categorías: tabla con columnas "Nombre" y "Tipo" (badges: Montura, Cristal Terminado, Bloque Tallado, Accesorio) y acciones editar/desactivar; botón "Nueva categoría" abre un modal con un campo nombre y un selector de tipo. Vista de productos: tabla con columnas "Marca", "Código / Modelo", "Categoría", "Tipo" y "Variantes" (número); barra de filtros con selector de tipo, selector de categoría, campo de marca y buscador; botón "Nuevo producto". Vista de formulario de producto: campos Marca, Código/Modelo, Descripción, Categoría, y opciones técnicas (índice de refracción, material, tratamiento, diseño), más una tabla editable de variantes con columnas SKU, Código de barras, Color, Tamaño, Esfera, Cilindro, Eje, Adición, Stock, Alerta mínima, Precio al mayor, Precio costo, y un botón "+ Agregar variante" y eliminar por fila. Vista de variantes: tabla con SKU, Producto, Color/Tamaño, gradiente óptico (esfera/cilindro/eje), Stock (celda verde, ámbar o roja según nivel), Precio mayor, Precio costo y una acción "Ajustar stock" que abre un modal con campo cantidad, motivo y el stock resultante. Incluye un interruptor "Solo stock bajo".

---

## 7. Recetas ópticas

**Pantallas**: lista + formulario (crear/editar).

**Backend**:
- `GET/POST /api/v1/recetas/`, `GET/PUT/PATCH/DELETE /api/v1/recetas/{id}/` (escritura admin, técnico taller, vendedor; lectura todos).
- Campos: `nombre_paciente`, `od_esfera`, `od_cilindro`, `od_eje`, `od_adicion`, `oi_esfera`, `oi_cilindro`, `oi_eje`, `oi_adicion`, `distancia_pupilar`, `notas`, `activo`.
- Rangos validados por backend: esfera/cilindro −30..30, eje 0..180, adición ≥ 0.

**Especificación visual**:
- Tabla: # receta, paciente, OD resumen, OI resumen, DP, estado, acciones.
- **Formulario**: dos tarjetas lado a lado **"OD (ojo derecho)"** y **"OI (ojo izquierdo)"**, cada una con esfera, cilindro, eje, adición; más DP (distancia pupilar) y notas; nombre del paciente arriba.
- Campos numéricos con stepper o input; validación de rangos en rojo.
- Permite asociar la receta a un pedido desde el detalle del pedido (selector).

### Prompt para Stitch
> Diseña el módulo de recetas ópticas de una aplicación web B2B de óptica, en español, estilo moderno corporativo, colores morado #6D28D9 y azul claro #38BDF8, temas claro y oscuro. Vista de lista: tabla con columnas "# Receta", "Paciente", "OD (resumen de esfera/cilindro/eje)", "OI (resumen)", "Distancia pupilar (DP)" y "Estado", con buscador y botón "Nueva receta". Vista de formulario: un campo superior "Nombre del paciente", luego dos tarjetas lado a lado tituladas "OD — Ojo derecho" y "OI — Ojo izquierdo", cada una con los campos Esfera, Cilindro, Eje y Adición (inputs numéricos), y debajo campos "Distancia pupilar (mm)" y "Notas" (textarea), con botones Guardar/Cancelar y validación en rojo cuando los valores están fuera de rango (esfera y cilindro entre -30 y 30, eje entre 0 y 180, adición mayor o igual a 0).

---

## 8. Pedidos

**Pantallas**: lista · detalle (timeline + acciones + documentos) · crear/editar.

**Backend**:
- `GET/POST /api/v1/pedidos/`, `GET/PUT/PATCH/DELETE /api/v1/pedidos/{id}/` (escritura admin, vendedor; `destroy` solo borrador).
- `POST /api/v1/pedidos/{id}/confirmar/` `{notas}` (admin, vendedor).
- `POST /api/v1/pedidos/{id}/cambiar-estado/` `{nuevo_estado, motivo}` (según transición y rol).
- Filtros: `?estado=`, `?cliente=`, `?usuario=`, `?numero_pedido=`, `?fecha_creado_after=&fecha_creado_before=`; search `numero_pedido`, cliente.
- Campos pedido: `numero_pedido` (PED-000123), `cliente`+`cliente_detalle`, `usuario`+`usuario_nombre`, `receta`+`receta_detalle`, `estado`, `subtotal`, `impuesto`, `total`, `notas`, `detalles[]`.
- Detalle de línea: `variante`+`variante_detalle` (sku, marca, código/modelo, color, tamaño, esfera/cilindro/eje/adición), `cantidad`, `precio_unitario`, `precio_total`.
- **Transiciones y roles**:
  | De | A | Roles |
  |---|---|---|
  | borrador | confirmado | admin, vendedor |
  | borrador | cancelado | admin, vendedor |
  | confirmado | en_taller | admin, técnico |
  | confirmado | cancelado | admin, vendedor |
  | en_taller | listo_para_despacho | admin, técnico |
  | en_taller | cancelado | admin, vendedor, técnico |
  | listo_para_despacho | enviado | admin, almacén |
  | listo_para_despacho | cancelado | admin, vendedor, técnico |
- Errores: `transicion_invalida` (409), `transicion_no_permitida` (403), `pedido_no_editable`/`pedido_no_eliminable` (409), `stock_insuficiente` (409).

**Especificación visual**:
- **Lista**: tabla con N.º pedido (mono), cliente, usuario, estado (badge), subtotal/impuesto/total, fecha; filtros de estado (chips o select), cliente (select autocompletado), rango de fechas, buscador; botón "Nuevo pedido".
- **Detalle**: cabecera con N.º + badge de estado + fecha; **timeline de estados** (stepper borrador→confirmado→en_taller→listo_para_despacho→enviado, cancelado resaltado en rojo) con el estado actual marcado; bloque cliente; bloque receta (si aplica, con OD/OI); tabla de detalles con precios y **resumen de totales** (subtotal, IVA 16%, total) destacado; notas; **acciones** según estado/rol: Confirmar, siguiente transición (con motivo en modal si aplica), Cancelar (con motivo obligatorio en modal), Editar (solo borrador), Eliminar (solo borrador); **botones de documentos**: Factura, Orden de trabajo, Nota de entrega (PDF).
- **Crear/Editar**: selector de cliente (búsqueda), selector de receta (opcional, listado de activas), **líneas de detalle** como tabla editable (selector de variante con búsqueda por SKU/marca → autocompleta precio_unitario con `precio_al_mayor`, cantidad, total por línea), notas; **resumen de totales en vivo** (subtotal, IVA 16%, total) — el backend recalcula al guardar; solo editable si está en borrador (si no, mostrar los valores readonly).

### Prompt para Stitch
> Diseña el módulo de pedidos de una aplicación web B2B de óptica, en español, estilo moderno corporativo, colores morado #6D28D9 y azul claro #38BDF8, temas claro y oscuro. Vista de lista: tabla con columnas "N.º pedido" (monoespaciado, ej. PED-000123), "Cliente", "Usuario", "Estado" (badges de color: Borrador gris, Confirmado morado, En Taller azul, Listo para Despacho ámbar, Enviado verde, Cancelado rojo), "Total" (moneda) y "Fecha"; barra de filtros con selector de estado, selector de cliente, rango de fechas y buscador; botón "Nuevo pedido". Vista de detalle: cabecera con número de pedido grande, badge de estado y fecha; debajo un stepper horizontal con los estados Borrador → Confirmado → En Taller → Listo para Despacho → Enviado (el actual en morado, los completados en verde, cancelado en rojo); tarjeta de cliente con su información; tarjeta de receta óptica si existe; tabla de detalles del pedido con producto, descripción, cantidad, precio unitario y total por línea; panel resumen con Subtotal, IVA (16%) y Total destacado; bloque de notas; botones de acción según estado: "Confirmar pedido", "Siguiente estado", "Cancelar pedido", "Editar" y "Eliminar", y botones para generar documentos "Factura PDF", "Orden de trabajo", "Nota de entrega". Vista de formulario: selector de cliente con búsqueda, selector de receta, tabla editable de líneas con selector de producto/variante que autocompleta el precio, cantidad y total por línea, un botón "+ Agregar línea", campo de notas y un panel de totales en vivo (Subtotal, IVA 16%, Total). Incluye modales de confirmación para cancelar pedido (con campo de motivo obligatorio) y de confirmación de transición de estado, más estados de carga, vacío y error.

---

## 9. Finanzas (Métodos de pago + Pagos + Libro Mayor)

**Pantallas**: lista de métodos de pago · lista de pagos · crear pago · aprobar/rechazar (modal) · libro mayor.

**Backend**:
- `/api/v1/metodos-pago/` CRUD (escritura admin, contabilidad). Campos: `nombre`, `moneda`, `requiere_referencia`, `activo`. Filtro `?moneda=`.
- `/api/v1/pagos/` — solo `GET/POST` en el viewset (no editar/eliminar: 409 `pago_no_editable`/`pago_no_eliminable`); `POST /api/v1/pagos/{id}/aprobar/` y `/rechazar/` `{motivo}` (admin, contabilidad).
- Campos pago: `cliente`+`cliente_detalle`, `pedido`+`pedido_numero`, `metodo_pago`+`metodo_pago_detalle`, `monto`, `tasa_cambio`, `numero_referencia`, `comprobante_imagen_url`, `estado`+`estado_display`, `fecha_pago`, `motivo_rechazo`.
- Filtros: `?estado=`, `?cliente=`, `?pedido=`, `?metodo_pago=`, `?fecha_pago_after=&fecha_pago_before=`.
- `/api/v1/libro-mayor/` solo lectura (admin, contabilidad). Campos: `cliente`+`cliente_detalle`, `pedido_numero`, `pago_detalle`, `tipo_asiento`+`tipo_asiento_display`, `monto`, `saldo_posterior`, `descripcion`, `asiento_origen_id`, `creado_en`. Filtros: `?cliente=`, `?tipo_asiento=`, `?fecha_creado_after=&fecha_creado_before=`.
- Errores: `referencia_requerida` (409, si el método exige referencia), `pago_excede_pedido` (409), `pago_estado_invalido` (409), `asiento_ya_revertido` (409).

**Especificación visual**:
- **Métodos de pago**: tabla (nombre, moneda, "requiere referencia" como switch/badge, activo), CRUD en modal.
- **Pagos**: tabla con cliente, pedido, método, monto, tasa, referencia, estado (badge: Pendiente ámbar, Aprobado verde, Rechazado rojo), fecha; filtros de estado/cliente/método/rango de fechas; botón "Registrar pago".
- **Registrar pago**: selector de cliente, selector de pedido (opcional, autocompleta cliente y muestra el total), selector de método de pago (si `requiere_referencia` muestra el campo referencia como obligatorio), monto, tasa de cambio (default 1), fecha, URL de comprobante (opcional).
- **Aprobar/Rechazar (modal)**: solo para pagos `pendiente`; aprobar → confirmación simple; rechazar → campo motivo obligatorio; mostrar `motivo_rechazo` en el detalle si rechazado.
- **Libro mayor**: tabla tipo asiento (Débito rojo/izquierda, Crédito verde/derecha), descripción, monto, **saldo posterior** (columna destacada, negativo en rojo), fecha; filtros por cliente/tipo/fecha; cabecera con saldo actual del cliente (último `saldo_posterior`). Solo lectura.

### Prompt para Stitch
> Diseña el módulo de finanzas de una aplicación web B2B de óptica, en español, estilo moderno corporativo, colores morado #6D28D9 y azul claro #38BDF8, temas claro y oscuro. Vista de métodos de pago: tabla con columnas "Nombre", "Moneda", "Requiere referencia" (badge Sí/No) y "Estado", con botón "Nuevo método" que abre un modal. Vista de pagos: tabla con columnas "Cliente", "N.º pedido", "Método", "Monto" (moneda), "Tasa de cambio", "Referencia", "Estado" (badges: Pendiente ámbar, Aprobado verde, Rechazado rojo) y "Fecha"; filtros de estado, cliente, método y rango de fechas; botón "Registrar pago". Vista de registrar pago: selector de cliente, selector de pedido opcional, selector de método de pago, monto, tasa de cambio (por defecto 1), número de referencia (obligatorio si el método lo requiere), fecha y campo opcional de URL de comprobante. Modal de aprobar pago con confirmación y modal de rechazar pago con campo de motivo obligatorio. Vista de libro mayor: tabla con columnas "Fecha", "Cliente", "Descripción", "Tipo" (Débito en rojo / Crédito en verde), "Monto", "Pedido", "Pago" y "Saldo posterior" (destacado, negativo en rojo); filtros por cliente, tipo de asiento y rango de fechas; una tarjeta superior con el saldo actual del cliente seleccionado. Todo solo lectura con indicación visual. Incluye estados de carga, vacío y error.

---

## 10. Documentos (Plantillas + Generación)

**Pantallas**: lista de plantillas · editor de plantilla · diálogo de generación.

**Backend**:
- `/api/v1/plantillas/` CRUD (escritura solo admin; lectura todos). Campos: `nombre`, `tipo_documento` (factura|orden_trabajo|nota_entrega|recibo_pago, único), `contenido_html`, `estilos_css`, `activo`, `actualizado_en`.
- `POST /api/v1/plantillas/{id}/generar/` con `{objeto_id, formato: "html"|"pdf"}` → **archivo binario** (Content-Disposition attachment). Roles: admin, contabilidad, vendedor.
- Por tipo: factura/orden_trabajo/nota_entrega consumen un **Pedido** (`objeto_id` = id pedido); recibo_pago consume un **Pago**.
- Errores: `objeto_no_encontrado` (404), `plantilla_inactiva` (409), `plantilla_invalida` (400), `documento_render_invalido` (400).

**Especificación visual**:
- **Plantillas**: tabla (nombre, tipo badge, estado, actualizado_en), solo admin puede crear/editar/desactivar; los demás ven tabla y pueden generar.
- **Editor de plantilla**: formulario con nombre, tipo (deshabilitado si existe), **área de texto HTML** (code editor con resaltado básico o textarea monoespaciado) y **área CSS**; vista previa del documento en un panel lateral (iframe con el HTML renderizado); validación de contenido no vacío; aviso de "template Django" (`{{ pedido.cliente.nombre_comercial }}` etc.) con ayuda contextual.
- **Generación**: se dispara desde el detalle de un Pedido (factura/orden/nota) o de un Pago (recibo); diálogo con selector de formato **HTML o PDF** y botón "Descargar"; manejo de descarga del blob (`Content-Disposition: attachment`).

### Prompt para Stitch
> Diseña el módulo de plantillas y documentos de una aplicación web B2B de óptica, en español, estilo moderno corporativo, colores morado #6D28D9 y azul claro #38BDF8, temas claro y oscuro. Vista de lista: tabla con columnas "Nombre", "Tipo de documento" (badges: Factura morado, Orden de Trabajo azul, Nota de Entrega gris, Recibo de Pago verde), "Estado" y "Última actualización", con buscador y botón "Nueva plantilla" (visible solo para administradores). Vista de editor: campos "Nombre" y "Tipo de documento" (selector deshabilitado al editar), una gran área de texto monoespaciado con resaltado para el "Contenido HTML" y otra para "Estilos CSS", un panel lateral con la vista previa del documento renderizado, y botones "Guardar" y "Cancelar"; muestra ayudas sobre las variables de plantilla (ej. {{ pedido.cliente.nombre_comercial }}). Dialog de generación de documento: selector de formato con dos opciones "HTML" y "PDF" y un botón "Descargar". Incluye estados de carga, vacío y error.

---

## 11. Perfil (cambiar contraseña, cerrar sesión)

**Pantallas**: 1 (perfil).

**Backend**:
- `GET /api/v1/auth/me/` (datos del usuario).
- `POST /api/v1/auth/cambiar-contrasena/` `{contrasena_actual, contrasena_nueva}` → errores `contrasena_incorrecta` (400).
- `POST /api/v1/auth/logout/` `{refresh}`.

**Especificación visual**:
- Tarjeta con datos del usuario (avatar con iniciales, nombre, usuario, correo, rol badge).
- **Formulario cambiar contraseña**: contraseña actual, nueva, confirmar (la confirmación es solo client-side; el backend recibe `contrasena_nueva`); validación de fuerza (mín. 8, no común, no numérica pura, no similar al usuario) mapeada del backend.
- Botón "Cerrar sesión" (con confirmación), limpia tokens y redirige al login.

### Prompt para Stitch
> Diseña la página de perfil de una aplicación web B2B de óptica, en español, estilo moderno corporativo, colores morado #6D28D9 y azul claro #38BDF8, temas claro y oscuro. Contenido: una tarjeta de perfil con avatar circular con las iniciales del usuario, nombre completo, nombre de usuario, correo y un badge con el rol. Debajo, un formulario "Cambiar contraseña" con los campos "Contraseña actual", "Contraseña nueva" y "Confirmar contraseña nueva" (con iconos de ojo), una nota con los requisitos de seguridad (mínimo 8 caracteres, no común, no solo numérica) y un botón morado "Actualizar contraseña". Abajo, una sección separada con un botón de "Cerrar sesión" en color rojo con icono. Incluye validación en rojo por campo y un toast de éxito.

---

## 12. Páginas de error y estados vacíos

**Pantallas**: 401 · 403 · 404 · 500 · vacíos.

**Backend**: no aplica (son del cliente), pero deben reaccionar a:
- 401 → redirigir al login (token expirado).
- 403 → pantalla "Sin permisos" (mensaje del envelope `message`).
- Cualquier 5xx → pantalla de error genérica con "Reintentar".

**Especificación visual**:
- Pantallas centradas con ilustración/ícono, título, mensaje claro, botón de acción ("Volver al inicio" / "Reintentar").
- Estados vacíos en cada lista: ícono + "No hay resultados" + botón de creación si aplica.

### Prompt para Stitch
> Diseña las páginas de error y estados vacíos de una aplicación web B2B de óptica, en español, estilo moderno corporativo, colores morado #6D28D9 y azul claro #38BDF8, temas claro y oscuro. Página 404: centro de pantalla con una ilustración grande (un par de gafas con signo de interrogación), título "Página no encontrada", texto "La página que buscas no existe o fue movida" y un botón morado "Volver al inicio". Página 403: ilustración de candado, título "Sin permisos", texto "No tienes permisos para realizar esta acción" y botón "Volver al inicio". Página 500: ilustración de un error del servidor, título "Algo salió mal", texto "Ocurrió un error inesperado" y botón "Reintentar". Estado vacío de una lista (ej. pedidos): icono de carpeta vacía, texto "No hay resultados" y botón para crear el primer registro. Todas consistentes con el app shell o centradas según el caso.

---

## 13. Fase 2 — Dashboard (plan de diseño e implementación)

**Objetivo**: panel de control navegable (KPIs por rol, accesos rápidos, pedidos/pagos recientes) consumiendo **un único endpoint agregado** de métricas (decisión: cálculo server-side; el frontend NO suma con paginación). Mantiene el sistema de diseño Material 3 y reutiliza `DataTable`, `PageHeader`, `StatusBadge`, `ErrorState`, `EmptyState`.

### Contrato backend (nuevo endpoint — dependencia de esta fase)

`GET /api/v1/dashboard/resumen/` — **todos los roles autenticados**; el servidor devuelve solo el subconjunto de KPIs del rol. Envelope estándar; `data`:

```json
{
  "fecha": "2026-08-02",
  "periodo": { "desde": "2026-08-01", "hasta": "2026-08-02" },
  "kpis": {
    "pedidos_por_estado": { "borrador": 0, "confirmado": 12, "en_taller": 34, "listo_para_despacho": 8, "enviado": 41, "cancelado": 2 },
    "total_vendido_mes": 18500.00,
    "clientes": 42,
    "stock_bajo": 18,
    "pagos_pendientes": { "cantidad": 5, "monto": 2450.00 },
    "saldo_por_cobrar": 12800.50
  },
  "recientes": {
    "pedidos": [ { "id": 1, "numero_pedido": "PED-000123", "cliente_nombre": "Sofía Martínez", "estado": "confirmado", "total": 120.00, "creado_en": "2026-08-02T10:00:00Z" } ],
    "pagos": [ { "id": 1, "cliente_nombre": "Javier Gómez", "metodo_pago_nombre": "Transferencia", "monto": 500.00, "estado": "pendiente", "creado_en": "2026-08-02T09:00:00Z" } ]
  }
}
```

**Alcance por rol** (`kpis` solo incluye lo visible; `recientes` ≤ 5 ítems, orden `-creado_en`):

| Rol | KPIs | Recientes |
|---|---|---|
| administrador | pedidos_por_estado, total_vendido_mes, clientes, stock_bajo, pagos_pendientes, saldo_por_cobrar | pedidos + pagos |
| vendedor_b2b | pedidos_por_estado, total_vendido_mes, clientes | pedidos |
| almacen | stock_bajo, pedidos_por_estado (confirmado/listo_para_despacho/enviado) | pedidos |
| tecnico_taller | pedidos_por_estado (confirmado/en_taller/listo_para_despacho) | pedidos |
| contabilidad | pagos_pendientes, saldo_por_cobrar, total_vendido_mes | pedidos + pagos |

Regla: **el grid es dirigido por presencia de claves** — si un KPI no viene, su tarjeta no se dibuja. Igual con `recientes.pagos`: la clave llega **ausente** para roles sin acceso (vendedor/almacén/técnico) y el panel "Últimos pagos" se oculta. Nota backend: implementado como "Fase 8 — dashboard (métricas)" en `PLAN_BACKEND.md` (vista read-only + `DashboardService` en `finance`; permiso `IsAuthenticated`).

### Especificación visual (KPI por rol)

- **PageHeader**: "Panel de control" + subtítulo con fecha larga localizada (dayjs `dddd D [de] MMMM`, ej. "Resumen de actividad para domingo, 2 de agosto").
- **KpiGrid** (`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter`), `KpiCard` altura `h-40`, icono en recuadro `rounded-lg`, label `font-label-sm uppercase tracking-widest`, valor `font-heading text-headline-lg`, sub-label, hover `-translate-y-0.5`:
  - `confirmado` → variante **primary** ("Confirmados") · `en_taller` → **secondary** ("En taller") · `listo_para_despacho` → **ámbar** ("Listos para despacho") · `enviado` → **verde** ("Enviados").
  - `total_vendido_mes` → **primary** ("Vendido del mes", moneda) · `clientes` → **secondary** ("Clientes activos").
  - `stock_bajo` → **ámbar** con icono `warning` y enlace "Ver inventario" → `/inventario`.
  - `pagos_pendientes` → **verde** (valor = monto, sub = "N pagos").
  - `saldo_por_cobrar` → valor moneda; **rojo** si negativo (crédito a favor).
- **Accesos rápidos** (botones `rounded-full`, icono + texto): vendedor/admin "Nuevo pedido · Registrar pago · Nueva variante"; almacén "Ajustar stock · Pedidos por despachar"; técnico "Pedidos en taller"; contabilidad "Registrar pago · Aprobar pagos". En esta fase navegan a la lista del módulo; deep-links a creación cuando aterricen las fases 5/7/8.
- **Recientes** (`grid grid-cols-1 lg:grid-cols-2 gap-gutter`): dos `Panel` (título + "Ver todos") con `DataTable`:
  - Pedidos: N.º pedido (mono), Cliente, Estado (`StatusBadge`), Total (derecha), Fecha; row click → `/pedidos`.
  - Pagos: Cliente, Método, Monto, Estado (`StatusBadge`), Fecha; row click → `/finanzas`.
- **Estados**: loading → `DashboardSkeleton` (tarjetas + tablas skeleton); error → `ErrorState` full-page con "Reintentar"; kpis vacíos → `EmptyState`.

### Arquitectura (archivos)

- **Endpoints** (`src/lib/api/endpoints.ts`): añadir `DASHBOARD = '/dashboard/resumen/'`.
- **Tipos** (`src/types/models.ts`): `EstadoPedido`, `EstadoPago`, `Periodo`, `DashboardKpis`, `PagosPendientesKpi`, `PedidoResumen`, `PagoResumen`, `DashboardResumen`.
- **Hook** `src/features/dashboard/hooks/useDashboard.ts`: `useApiQuery(['dashboard','resumen'], DASHBOARD, { refetchOnWindowFocus: true })` → `{ resumen, isLoading, isError, error, refetch }`.
- **Compartidos** (`src/components/data/`): `KpiCard.tsx` (genérico, reutilizable en reportes) y `Panel.tsx` (card con cabecera título + acción).
- **Locales** (`src/features/dashboard/components/`): `kpiConfig.ts` (mapeo `kpis → KpiCardProps`), `KpiGrid.tsx`, `QuickActions.tsx`, `RecentOrders.tsx`, `RecentPayments.tsx`, `DashboardSkeleton.tsx`.
- **Página** `src/features/dashboard/pages/DashboardPage.tsx`: reemplaza el placeholder por el flujo de estados.
- **Toast de bienvenida**: en el montaje del dashboard, una vez por sesión (guard `sessionStorage`), con el nombre del usuario; se elimina el toast genérico del login para no duplicar.

### Checklist de implementación

1. `endpoints.ts` + `types/models.ts` (contrato). ✅
2. `components/data/KpiCard.tsx` + `Panel.tsx`. ✅
3. `useDashboard.ts` + `kpiConfig.ts` + `KpiGrid` + `QuickActions` + `RecentOrders` + `RecentPayments` + `DashboardSkeleton`. ✅
4. Reescribir `DashboardPage.tsx` (loading/error/empty/success). ✅
5. Ajustar toast de bienvenida (login + dashboard). ✅
6. Backend: `GET /dashboard/resumen/` (Fase 8 de `PLAN_BACKEND.md`) — ✅ implementado (`DashboardService` en `finance`).
7. Verificación: `pnpm lint`, `pnpm build`, prueba manual por rol.

### Prompt para Stitch
> Diseña el panel principal (dashboard) de una aplicación web B2B para una óptica, en español, estilo moderno corporativo, colores morado #6D28D9 y azul claro #38BDF8, temas claro y oscuro, con el app shell de barra lateral y barra superior. Cabecera con título "Panel de control" y subtítulo con la fecha del día. Grilla de 4 tarjetas KPI con icono, etiqueta en mayúsculas pequeñas, número grande y una línea de detalle: una morada "Pedidos confirmados", una azul "En taller", una ámbar con icono de alerta "Stock bajo" y enlace "Ver inventario", y una verde "Pagos pendientes". Debajo, una fila de accesos rápidos como botones redondeados: "Nuevo pedido", "Registrar pago", "Nueva variante". Luego dos paneles lado a lado: "Últimos pedidos" (tabla con N.º pedido, cliente, estado como badge de color y total en moneda, con enlace "Ver todos") y "Últimos pagos" (tabla con cliente, método, monto, estado y fecha). Incluye el estado de carga con esqueletos de tarjetas y tablas, el estado vacío y el estado de error con botón "Reintentar".

---

## Guía de implementación (roadmap página por página)

El frontend se implementa por fases. Cada fase entrega una **página navegable y funcional** (diseño Stitch → implementación). Orden recomendado:

| Fase | Entregable | Endpoints | Componentes a construir | Estado |
|---|---|---|---|---|
| **0. Fundación** | Migrar a TypeScript, instalar deps, proxy `/api`, alias `@/`, `@theme` Material 3, shadcn init, `lib/api/client.ts`, providers, limpiar boilerplate (App.css/assets) | — | `Icon`, `cn`, `lib/api/*`, `types/*`, `lib/constants/*` | ✅ Implementada |
| **1. Auth + Shell + Perfil** | Login · AppShell (sidebar colapsable + topbar + menú usuario) · rutas protegidas/por rol · Perfil (cambiar contraseña, logout) | `auth/login`, `auth/refresh`, `auth/me`, `auth/cambiar-contrasena`, `auth/logout` | `AppShell`, `Sidebar`, `Topbar`, `UserMenu`, `ProtectedRoute`, `RoleRoute`, shadcn `ui/*` | ✅ Implementada |
| **2. Dashboard** | KPIs por rol, accesos rápidos, pedidos/pagos recientes, toast de bienvenida | `dashboard/resumen/` (ver §13) | **`KpiCard`**, `Panel`, `KpiGrid`, `QuickActions`, `RecentOrders`, `RecentPayments`, `DashboardSkeleton` | ✅ Implementada (plan en §13) |
| **3. Clientes** | Lista + detalle (crédito) + formulario drawer + desactivar | `clientes/` CRUD, `?search=` | `ConfirmDialog`, `Drawer`, `SectionCard`, `FieldError` | ⏳ Pendiente |
| **4. Usuarios (admin)** | Lista + form drawer + activar/desactivar | `usuarios/` CRUD | (reutiliza los anteriores) | ⏳ Pendiente |
| **5. Inventario** | Categorías · Productos (variantes anidadas) · Variantes (`stock_bajo`) · modal ajustar stock | `categorias/`, `productos/`, `variantes/`, `variantes/{id}/ajustar-stock/` | `MoneyInput`, tablas editables, modal | ⏳ Pendiente |
| **6. Recetas** | Lista + formulario OD/OI | `recetas/` CRUD | — | ⏳ Pendiente |
| **7. Pedidos** | Lista con filtros · detalle (stepper + transiciones por rol + documentos) · crear/editar (líneas + totales en vivo) | `pedidos/` CRUD, `{id}/confirmar/`, `{id}/cambiar-estado/` | `OrderStepper`, selector de variante, `OrderActions` | ⏳ Pendiente |
| **8. Finanzas** | Métodos de pago · Pagos (aprobar/rechazar con motivo) · Libro mayor (solo lectura) | `metodos-pago/`, `pagos/`, `{id}/aprobar|rechazar/`, `libro-mayor/` | — | ⏳ Pendiente |
| **9. Documentos** | Plantillas (editor HTML/CSS admin + preview) · diálogo generar + descarga blob | `plantillas/` CRUD, `{id}/generar/` | editor de código ligero | ⏳ Pendiente |
| **10. Pulido** | Empty states en todas las listas, páginas 403/404/500, auditoría dark mode y accesibilidad | — | `ErrorPages` | ⏳ Pendiente |

**Principios por fase**: cada página consume el envelope (no `response.data` de DRF en crudo) vía `useApi`; los errores se mapean a campos/toast; las acciones se muestran/ocultan según el rol de `auth/me`; los estados de carga/vacío/error se heredan de `DataTable`/`EmptyState`.
