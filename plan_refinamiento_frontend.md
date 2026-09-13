# Plan de Refinamiento Frontend — OptiRosse UI v2
## Stack: React 19 · Vite 8 · Tailwind v4 · shadcn/ui · TanStack · Lucide · Sonner

> **Alcance:** Reescritura completa de la capa de UI. El backend, la lógica de API
> (`apiClient`, `useApiQuery`, `useApiMutation`), los stores de Zustand y los tipos
> TypeScript se conservan. Solo se reemplaza la presentación.
> **No se toca ningún archivo de `lib/`, `hooks/`, `store/` ni `types/`.**

---

## Principios de Diseño

| Principio | Regla |
|---|---|
| **Cero ruido visual** | Sin gradientes agresivos, sin sombras pesadas. Espacios en blanco generosos |
| **Iconos consistentes** | 100 % Lucide React — sin `material-symbols` después de la migración |
| **Feedback inmediato** | Todo estado (loading, error, vacío, éxito) tiene representación visual |
| **Un patrón por acción** | Crear/editar → Drawer derecho. Confirmar/eliminar → Dialog. Ver detalles → Página propia |
| **Colores funcionales** | Los colores indican estado (verde=ok, rojo=error, amarillo=alerta) — nunca decoración |

---

## Dependencias a Instalar / Ajustar

```bash
# Agregar
pnpm add lucide-react @tanstack/react-table

# Ya instaladas y se conservan
# sonner, vaul, @radix-ui/*, react-hook-form, zod, dayjs, zustand, @tanstack/react-query
```

> **Eliminar de uso (no desinstalar para no romper tree-shaking):**
> `material-symbols` — dejar de importar en `index.css` una vez reemplazado
> todos los `<Icon name="..." />` por `<LucideIcon />`.

---

## Paleta y Tokens de Diseño

La paleta actual (Material 3 mapeada a CSS variables) **se conserva**.
Solo se ajusta `index.css` para:

1. Eliminar `@import "material-symbols"` (al final de la migración)
2. Añadir variables de radio de borde y spacing específicas para el nuevo sistema

```css
/* Añadir al bloque @theme */
--radius-sm:  6px;
--radius-md:  10px;
--radius-lg:  14px;
--radius-xl:  18px;
--sidebar-width: 240px;
--sidebar-collapsed-width: 64px;
--header-height: 56px;
```

---

## Estructura de Componentes Nueva

```
src/components/
├── layout/
│   ├── AppShell.tsx          MODIFICAR — nuevo grid con sidebar colapsable
│   ├── Sidebar.tsx           REESCRIBIR — Lucide, colapso animado, panel usuario inferior
│   ├── Header.tsx            RENOMBRAR+REESCRIBIR — solo breadcrumb, sin UserMenu
│   ├── Breadcrumb.tsx        NUEVO — breadcrumb automático según ruta
│   ├── FullPageLoader.tsx    MODIFICAR — spinner centrado
│   └── guards.tsx            SIN CAMBIOS
│   # UserMenu.tsx — ELIMINAR (absorbido por panel inferior de Sidebar)
│
├── ui/                       (shadcn primitivos — ampliar, no reescribir)
│   ├── button.tsx            CONSERVAR
│   ├── input.tsx             CONSERVAR
│   ├── select.tsx            CONSERVAR
│   ├── dialog.tsx            CONSERVAR
│   ├── drawer.tsx            CONSERVAR (vaul)
│   ├── tabs.tsx              CONSERVAR
│   ├── badge.tsx             CONSERVAR
│   ├── skeleton.tsx          CONSERVAR
│   ├── tooltip.tsx           CONSERVAR
│   ├── separator.tsx         CONSERVAR
│   ├── switch.tsx            CONSERVAR
│   ├── checkbox.tsx          CONSERVAR
│   ├── popover.tsx           CONSERVAR
│   ├── sonner.tsx            CONSERVAR
│   ├── command.tsx           CONSERVAR
│   ├── dropdown-menu.tsx     CONSERVAR
│   └── table.tsx             NUEVO — wrapper TanStack Table base
│
├── data/
│   ├── DataTable.tsx         REESCRIBIR — TanStack Table v8, sorting, col visibility
│   ├── DataTableToolbar.tsx  REESCRIBIR — búsqueda + filtros + toggle vista
│   ├── DataTablePagination.tsx NUEVO — paginación moderna + selector de registros
│   ├── KpiCard.tsx           REESCRIBIR — Lucide icons, variante compact/full
│   ├── PageHeader.tsx        REESCRIBIR — title, description, slot de acciones
│   ├── EmptyState.tsx        REESCRIBIR — ilustración SVG inline + Lucide
│   ├── ErrorState.tsx        REESCRIBIR — mensaje + retry con Lucide
│   ├── StatusBadge.tsx       REESCRIBIR — variantes color por estado con Lucide dot
│   ├── StockBadge.tsx        REESCRIBIR — stock OK / bajo / agotado
│   ├── Panel.tsx             REESCRIBIR — card limpia con title y slot header-right
│   ├── SkeletonRows.tsx      CONSERVAR
│   ├── ViewToggle.tsx        REESCRIBIR — List / Grid con Lucide (LayoutList / LayoutGrid)
│   └── SortableHeader.tsx    NUEVO — header de columna con indicador de orden
│
├── forms/
│   ├── AppDrawer.tsx         NUEVO — wrapper universal para formularios en drawer
│   ├── ConfirmDialog.tsx     REESCRIBIR — variantes default/destructive con Lucide
│   ├── MotivoDialog.tsx      REESCRIBIR — textarea + validación
│   ├── SearchableSelect.tsx  CONSERVAR (command palette interna)
│   ├── MoneyInput.tsx        CONSERVAR
│   ├── FieldError.tsx        CONSERVAR
│   ├── SectionCard.tsx       CONSERVAR
│   └── GenerarDocumentoDialog.tsx REESCRIBIR — steps con tabs
│
├── filters/
│   ├── FilterBar.tsx         NUEVO — contenedor horizontal de chips de filtro
│   ├── FilterChip.tsx        REESCRIBIR — activo/inactivo, removable
│   └── FilterDateRange.tsx   NUEVO — rango de fechas con Popover + Calendar
│
└── Icon.tsx                  ELIMINAR — reemplazado por imports directos de lucide-react
```

---

## Shell de Aplicación

### `AppShell` — Grid layout con sidebar colapsable

```
┌──────────────┬────────────────────────────────────────┐
│              │  HEADER (56px, fijo)                   │
│   SIDEBAR    ├────────────────────────────────────────┤
│  (240px /    │                                        │
│   64px       │         CONTENIDO PRINCIPAL            │
│  colapsado)  │         (scroll independiente)         │
│              │                                        │
└──────────────┴────────────────────────────────────────┘
```

- El sidebar persiste su estado abierto/colapsado en `localStorage`
- En móvil (`< lg`) el sidebar es un Sheet (drawer) que se abre con hamburger
- El contenido principal hace scroll independiente del sidebar y el header

### `Sidebar` — Navegación principal

**Secciones:**
```
─── OptiRosse (logo + colapso toggle) ─────────
  Dashboard          LayoutDashboard
  Pedidos            ShoppingCart
  Recetas            FileText
  Pacientes          Users          [NUEVO — post backend]
  Clientes           Building2
─── Inventario ─────────────────────────────────
  Productos          Package
─── Administración (solo admin) ────────────────
  Finanzas           DollarSign
  Documentos         FolderOpen
  Usuarios           UserCog
  Auditoría          Activity
─── (espacio flex-1 empuja hacia abajo) ─────────
─── Panel de usuario (parte inferior fija) ──────
  [Avatar] Nombre · Rol     → abre Popover/Menu
     ├── Ver perfil          User
     ├── Cambiar tema        Sun / Moon
     └── Cerrar sesión       LogOut
```

**Comportamiento colapsado:**
- Solo muestra iconos de 20px centrados con Tooltip en hover
- El logo colapsa a solo el isotipo
- El panel de usuario colapsado muestra solo el `Avatar` — click abre el Popover igualmente

**Panel de usuario (parte inferior del sidebar):**
```
┌─────────────────────────────────┐
│  [AV]  Nombre Apellido          │  ← click abre Popover hacia arriba
│        Administradora     ⋯     │
└─────────────────────────────────┘
```
- El Popover se abre **hacia arriba** (`side="top"`) para no salir de pantalla
- En estado colapsado solo muestra el Avatar con Tooltip
- Opciones del Popover:
  - **Ver perfil** (User) → navega a `/perfil`
  - **Tema claro / oscuro** (Sun / Moon) → toggle
  - Separador
  - **Cerrar sesión** (LogOut, color error) → LogoutConfirmDialog

### `Header` — Topbar fijo

```
[Hamburger (móvil)]  [Breadcrumb automático]
```

- **Sin UserMenu** — todas las opciones de usuario están en el sidebar inferior
- **Breadcrumb:** Se genera automáticamente a partir de la ruta activa.
  - `/pedidos` → `Pedidos`
  - `/pedidos/123` → `Pedidos / PED-000123`
  - `/clientes/5` → `Clientes / Nombre del cliente`
- Header limpio — solo navegación, sin elementos de usuario

---

## Componente `AppDrawer` — Formularios universales

Todos los formularios de crear/editar se presentan en un drawer deslizable desde la derecha.

```tsx
<AppDrawer
  open={open}
  onOpenChange={setOpen}
  title="Nueva receta"
  description="Registra la graduación del paciente"
  size="md"   // sm | md | lg | xl
>
  <RecetaForm onSuccess={() => setOpen(false)} />
</AppDrawer>
```

**Props:**
- `size`: `sm` = 400px · `md` = 520px · `lg` = 680px · `xl` = 840px
- El footer con botones (Guardar / Cancelar) va dentro del formulario child
- Se cierra al hacer clic fuera o presionar Escape
- En móvil se convierte en Sheet desde abajo (vaul)

---

## Sistema de Tablas — TanStack Table v8

### `DataTable` — Tabla base reutilizable

```tsx
<DataTable
  columns={columns}
  data={data}
  isLoading={isLoading}
  isError={isError}
  emptyMessage="No hay pedidos registrados"
/>
```

**Capacidades estándar:**
- Sorting por columna (click en header)
- Visibilidad de columnas (dropdown "Columnas")
- Row selection (checkbox, opcional)
- Skeleton rows durante carga
- Estado vacío y estado error integrados

### `DataTableToolbar` — Barra de herramientas

```
[🔍 Buscar...]  [Filtros activos como chips]  [Columnas▼]  [Vista: ☰ ⊞]
```

### `DataTablePagination` — Paginación moderna

```
Mostrando 1–20 de 143 registros    [Registros: 10▼]    [< 1 2 3 ... 8 >]
```

- Selector de registros por página: 10 / 20 / 50 / 100
- Navegación: Primera · Anterior · Páginas con ellipsis · Siguiente · Última
- El estado persiste en `localStorage` por módulo (clave única por sección)

---

## Diseño por Módulo / Página

---

### `/` — Dashboard

**KPIs superiores (4 tarjetas):**

| Tarjeta | Icono | Dato |
|---|---|---|
| Pedidos del mes | ShoppingCart | Cantidad + variación % |
| Total vendido | TrendingUp | Monto en USD |
| Clientes activos | Users | Total |
| Stock bajo | AlertTriangle | Cantidad de variantes |

**Layout:**
```
[KPI] [KPI] [KPI] [KPI]
[Pedidos recientes — tabla compacta (5 filas)]  [Pagos pendientes — lista]
```

- Sin filtros en dashboard — solo lectura.
- Botón "Ver todos" en cada sección enlaza al módulo correspondiente.

---

### `/pedidos` — Lista de Pedidos

**KPIs (barra compacta, 5 chips de estado):**
```
Borrador: 3  ·  Confirmado: 12  ·  En Laboratorio: 8  ·  Listo: 4  ·  Entregado: 201
```
Click en un chip filtra la tabla por ese estado.

**Filtros inteligentes:**
- Búsqueda: número de pedido, nombre de cliente/paciente
- Estado: multi-select chips (Borrador / Confirmado / En Laboratorio / Listo / Entregado / Cancelado)
- Tipo: Laboratorio / Mostrador
- Rango de fechas: Popover con dos inputs de fecha

**Tabla (columnas):**
| N° Pedido | Destinatario | Tipo | Estado | Total | Fecha | Acciones |
|---|---|---|---|---|---|---|

**Acciones de fila:**
- Ver → navega a `/pedidos/:id`
- Editar (si borrador) → navega a `/pedidos/:id/editar`
- Confirmar (si borrador) → Dialog de confirmación inline

**Nuevo pedido:**
- Botón `+ Nuevo pedido` en PageHeader
- Navega a página `/pedidos/nuevo` (formulario completo, no drawer — es un flujo largo)

---

### `/pedidos/nuevo` y `/pedidos/:id/editar` — Formulario de Pedido

Permanece como página completa (no drawer) por la complejidad del formulario.

**Mejoras visuales:**
- Secciones en `Panel` con separadores claros
- Selector de destinatario: tabs `Óptica` / `Paciente` — cada tab muestra el SearchableSelect correspondiente
- Líneas de pedido: tabla editable con inputs inline
- Totales: panel sticky al final con subtotal, impuesto, total
- Selector de receta: SearchableSelect con preview de graduación al seleccionar

---

### `/pedidos/:id` — Detalle de Pedido

**Layout:**
```
[← Pedidos]
[PageHeader: PED-000123 · Estado Badge · Acciones]

[Timeline horizontal de estados]

[Líneas del pedido — tabla]        [Panel Resumen lateral]
[Receta asociada — panel]          [Panel Pagos]
[Notas]
```

**Timeline de estados (horizontal):**
```
● Borrador → ● Confirmado → ○ En Laboratorio → ○ Listo → ○ Entregado
```
- Estado actual resaltado con color primario
- Estados pasados con check (CheckCircle)
- Estados futuros grises

**Acciones según estado:**
- `borrador`: Confirmar · Editar · Eliminar
- `confirmado`: Marcar En Laboratorio · Cancelar
- `en_laboratorio`: Marcar Listo · Cancelar
- `listo_para_entrega`: Marcar Entregado · Cancelar
- `entregado`/`cancelado`: solo lectura · Generar documento

---

### `/recetas` — Lista de Recetas

> Se actualiza para reflejar el nuevo modelo con `Paciente` (post backend).
> Por ahora mantiene `nombre_paciente` hasta que el backend esté migrado.

**Filtros:**
- Búsqueda por nombre de paciente
- Toggle activas / inactivas

**Tabla:**
| Paciente | OD Esfera | OI Esfera | DP | Médico | Creada | Estado | Acciones |

**Crear/Editar:** Drawer derecho `size="lg"`

**Drawer de Receta — secciones con tabs:**
```
Tabs: [Ojo Derecho]  [Ojo Izquierdo]  [General]
```
- Tab OD: Esfera, Cilindro, Eje, Adición
- Tab OI: Esfera, Cilindro, Eje, Adición
- Tab General: DP, Médico prescriptor, Notas

---

### `/clientes` — Lista de Clientes (Ópticas B2B)

**KPIs:**
- Total clientes activos
- Clientes con saldo vencido
- Clientes nuevos este mes

**Filtros:**
- Búsqueda: nombre comercial, razón social, RIF
- Toggle activos / inactivos

**Tabla:**
| Nombre comercial | RIF | Correo | Teléfono | Límite crédito | Estado | Acciones |

**Crear/Editar:** Drawer `size="md"`
**Ver detalle:** Página `/clientes/:id` con tabs:
```
Tabs: [Información]  [Pedidos]  [Pagos]  [Libro mayor]
```

---

### `/pacientes` — Lista de Pacientes (NUEVO — post backend)

**Filtros:**
- Búsqueda: nombre, apellido, cédula
- Toggle activos / inactivos

**Tabla:**
| Nombre | Cédula | Teléfono | Correo | Recetas | Óptica asociada | Estado | Acciones |

**Crear/Editar:** Drawer `size="md"`
**Historial de recetas:** Panel expandible en fila o pestaña en detalle

---

### `/inventario` — Productos

**Vista dual (List / Grid):**
Botón ViewToggle en toolbar para alternar entre:

**Vista Lista (tabla TanStack):**
| Producto | SKU | Categoría | Stock | Precio | Estado | Acciones |

**Vista Grid (tarjetas):**
```
┌─────────────────┐  ┌─────────────────┐
│  [Icono tipo]   │  │  [Icono tipo]   │
│  Nombre modelo  │  │  Nombre modelo  │
│  Marca · Cat.   │  │  Marca · Cat.   │
│  Stock: 12      │  │  Stock: ⚠ 2     │
│  $45.00         │  │  $45.00         │
│  [Ver] [Editar] │  │  [Ver] [Editar] │
└─────────────────┘  └─────────────────┘
```

**Filtros:**
- Búsqueda: nombre, SKU, código de barras
- Categoría: multi-select
- Tipo producto: Montura / Cristal / Bloque / Accesorio
- Stock: Todos / Bajo / Sin stock
- Toggle activos / inactivos

**Crear/Editar Producto:** Drawer `size="xl"` con tabs:
```
Tabs: [Información]  [Variantes]
```
- Tab Información: nombre, marca, categoría, descripción, especificaciones técnicas
- Tab Variantes: tabla editable con SKU, color, talla, stock, precio

**KPIs en barra superior:**
- Total de variantes activas
- Variantes con stock bajo (enlace filtrado)
- Variantes sin stock

---

### `/finanzas` — Módulo Financiero

**Tabs principales:**
```
Tabs: [Pagos]  [Libro Mayor]  [Métodos de Pago]
```

**Tab Pagos:**
- KPIs: Pagos pendientes · Total aprobado este mes · Monto pendiente
- Filtros: Estado (pendiente/aprobado/rechazado) · Rango fecha · Método de pago
- Tabla: Cliente/Paciente · Pedido · Monto · Método · Estado · Fecha · Acciones

**Tab Libro Mayor:**
- Filtros: Cliente/Paciente · Tipo asiento · Rango fecha
- Tabla: Fecha · Descripción · Débito · Crédito · Saldo
- Saldo total resaltado en footer de tabla

**Tab Métodos de Pago:**
- Lista simple con toggle activo/inactivo
- Crear/Editar: Drawer pequeño `size="sm"`

---

### `/documentos` — Gestión Documental

**Tabs:**
```
Tabs: [Documentos de empresa]  [Plantillas]
```

**Tab Documentos de empresa:**
- Filtros: Categoría · Toggle activos / inactivos
- Tabla: Nombre · Categoría · Versión · Tipo · Fecha · Acciones

**Tab Plantillas:**
- Tabla: Nombre · Tipo documento · Última modificación · Estado · Acciones
- Editor de plantilla: Page completa `/documentos/plantillas/:id/editar`

---

### `/usuarios` — Gestión de Usuarios (solo Admin)

**Filtros:**
- Búsqueda: nombre, usuario, correo
- Rol: Administrador / Vendedora
- Toggle activos / inactivos

**Tabla:**
| Usuario | Nombre completo | Correo | Rol | Estado | Creado | Acciones |

**Crear/Editar:** Drawer `size="sm"`

---

### `/auditoria` — Registros de Auditoría (solo Admin)

**Filtros:**
- Búsqueda: usuario, acción
- Tabla afectada: select
- Rango de fechas

**Tabla:** Solo lectura — sin acciones de fila.
| Fecha | Usuario | Acción | Tabla | ID objeto | IP |

Click en fila expande `detalles` JSON en un acordeón.

---

### `/perfil` — Perfil del usuario

**Layout de 2 columnas:**
```
[Avatar + nombre + rol]    [Formulario: nombre, apellido, correo, teléfono]
                           [Sección: Cambiar contraseña]
```

Sin drawer — formulario en página directamente (es corto y personal).

---

## Sistema de Notificaciones — Sonner

Reemplaza el `useToast` actual con Sonner como sistema único.

```tsx
// Éxito
toast.success('Pedido confirmado', { description: 'El stock ha sido actualizado.' })

// Error
toast.error('No se pudo guardar', { description: error.message })

// Info
toast.info('Receta desactivada')

// Con acción
toast('Cliente creado', {
  action: { label: 'Ver', onClick: () => navigate(`/clientes/${id}`) }
})
```

**Configuración del Toaster:**
- Posición: `bottom-right`
- Duración: 4000ms (errores: 6000ms)
- Máximo 3 toasts visibles

---

## Patrones de UX

### Estados de carga
- **Tablas:** SkeletonRows (6 filas con columnas en proporción real)
- **KPIs:** Skeleton rectangular del tamaño de la card
- **Drawers:** Skeleton del formulario (no spinner flotante)
- **Páginas completas:** Solo en carga inicial — `FullPageLoader` con logo

### Estados vacíos
```
     [Icono Lucide grande, color muted]
     "No hay pedidos registrados"
     "Crea el primer pedido para comenzar"
     [Botón acción primaria]
```

### Estados de error
```
     [AlertCircle, color error]
     "Ocurrió un error al cargar los datos"
     [Botón "Reintentar"]
```

### Confirmación de acciones destructivas
```tsx
<ConfirmDialog
  title="¿Eliminar este producto?"
  description="Esta acción no se puede deshacer."
  confirmLabel="Eliminar"
  variant="destructive"
  icon={<Trash2 />}
/>
```

### Mensajes amigables — Guía de redacción

| Situación | Mensaje |
|---|---|
| Crear exitoso | "Pedido creado correctamente" |
| Editar exitoso | "Cambios guardados" |
| Eliminar exitoso | "Eliminado correctamente" |
| Error de red | "No se pudo conectar con el servidor" |
| Error validación | "Revisa los campos marcados en rojo" |
| Sin permiso | "No tienes permiso para realizar esta acción" |
| Sesión expirada | "Tu sesión ha expirado. Inicia sesión nuevamente" |

---

## Migración de `<Icon name="..." />` → Lucide React

El componente `Icon.tsx` actual usa `material-symbols`. Se elimina gradualmente:

```tsx
// ANTES
import { Icon } from '@/components/Icon'
<Icon name="add" size={18} />

// DESPUÉS
import { Plus } from 'lucide-react'
<Plus size={18} />
```

**Mapa de equivalencias principales:**

| Material Symbol | Lucide |
|---|---|
| `add` | `Plus` |
| `edit` | `Pencil` |
| `delete` | `Trash2` |
| `arrow_back` | `ArrowLeft` |
| `check_circle` | `CheckCircle2` |
| `block` | `Ban` |
| `visibility` | `Eye` |
| `history` | `History` |
| `description` | `FileText` |
| `search` | `Search` |
| `filter_list` | `SlidersHorizontal` |
| `logout` | `LogOut` |
| `person` | `User` |
| `settings` | `Settings` |
| `chevron_right` | `ChevronRight` |
| `dashboard` | `LayoutDashboard` |
| `inventory_2` | `Package` |
| `shopping_cart` | `ShoppingCart` |
| `receipt_long` | `Receipt` |
| `account_balance` | `DollarSign` |
| `folder_open` | `FolderOpen` |
| `manage_accounts` | `UserCog` |
| `security` | `Activity` |

---

## Orden de Implementación

### Fase 0 — Fundación (sin páginas, solo infraestructura)
- [ ] Instalar `lucide-react` y `@tanstack/react-table`
- [ ] Crear `AppDrawer.tsx` (wrapper universal de drawer)
- [ ] Reescribir `AppShell.tsx` (nuevo grid)
- [ ] Reescribir `Sidebar.tsx` (Lucide, colapso, persistencia)
- [ ] Reescribir `Header.tsx` + crear `Breadcrumb.tsx`
- [ ] Reescribir `PageHeader.tsx`, `Panel.tsx`, `KpiCard.tsx`
- [ ] Reescribir `EmptyState.tsx`, `ErrorState.tsx`, `StatusBadge.tsx`
- [ ] Crear `DataTablePagination.tsx`
- [ ] Reescribir `DataTable.tsx` con TanStack Table
- [ ] Reescribir `DataTableToolbar.tsx`
- [ ] Reescribir `ConfirmDialog.tsx`, `FilterChip.tsx`
- [ ] Añadir `table.tsx` a `ui/`

### Fase 1 — Módulos sin nuevas rutas (refactor in-place)
- [ ] Dashboard — KPIs + tablas recientes
- [ ] Pedidos — Lista + filtros + paginación
- [ ] Pedido Detalle — timeline + panel resumen
- [ ] Pedido Form — tabs destinatario + tabla líneas
- [ ] Recetas — tabla + drawer formulario con tabs
- [ ] Clientes — tabla + drawer + detalle con tabs

### Fase 2 — Módulos con vistas nuevas
- [ ] Inventario — vista lista + vista grid + drawer producto
- [ ] Finanzas — tabs Pagos / Libro Mayor / Métodos
- [ ] Documentos — tabs Documentos / Plantillas
- [ ] Usuarios — tabla + drawer

### Fase 3 — Módulos admin y limpieza
- [ ] Auditoría — tabla solo lectura + expand fila
- [ ] Perfil — formulario en página
- [ ] Eliminar `Icon.tsx` y `@import "material-symbols"` de CSS
- [ ] Pacientes (post migración backend)
- [ ] Actualizar `router.tsx` para limpiar roles obsoletos

---

## Archivos a ELIMINAR al finalizar

| Archivo | Motivo |
|---|---|
| `components/Icon.tsx` | Reemplazado por Lucide directamente |
| `components/layout/Topbar.tsx` | Renombrado y reescrito como `Header.tsx` |
| `components/layout/UserMenu.tsx` | Absorbido en la parte inferior del `Sidebar.tsx` |
| `components/data/ViewToggle.tsx` | Reescrito como parte de `DataTableToolbar` |
| `components/filters/FilterChip.tsx` | Reescrito en `filters/FilterChip.tsx` (nueva ubicación) |

---

## Invariantes (No se toca nada de esto)

- `lib/api/` — apiClient, endpoints, interceptores, authSync
- `hooks/useApi.ts`, `hooks/usePagination.ts`
- `store/useAuth.ts`, `store/useToast.ts` (el logout sigue usando el store, solo cambia desde dónde se llama)
- `types/api.ts`, `types/models.ts`
- `app/providers.tsx`, `app/ThemeProvider.tsx`
- Variables CSS en `index.css` (paleta Material 3)
- Todos los hooks de features (`useRecetas`, `usePedido`, etc.)
- Todos los servicios de mutación (`useRecetaMutations`, etc.)
- La estructura de rutas base (`router.tsx`) — solo se limpian los roles
