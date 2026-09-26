# Arquitectura del proyecto

## 1. Descripción general

Frontend de trabajo final de la carrera de Ingeniería en Sistemas de Información (FRLP). SPA construida en React que consume una API REST en Ruby on Rails.

**Repositorio:** `proyectoFinalFRLP/proyecto-web`  
**Gestor de tareas:** Jira (proyecto `TESIS`)

---

## 2. Stack tecnológico

| Tecnología           | Versión | Rol                                 |
| -------------------- | ------- | ----------------------------------- |
| React                | 19      | Biblioteca de UI                    |
| TypeScript           | ~5.9    | Tipado estático                     |
| Vite                 | 8       | Bundler y dev server                |
| MUI (Material UI)    | 7       | Componentes de UI y theming         |
| Emotion              | 11      | Motor CSS-in-JS (requerido por MUI) |
| React Router         | 7       | Routing client-side                 |
| Zustand              | 5       | Estado global (UI state)            |
| TanStack React Query | 5       | Estado del servidor / data fetching |
| Axios                | 1       | Cliente HTTP                        |
| React Hook Form      | 7       | Gestión de formularios              |
| Zod                  | 4       | Validación de schemas y tipos       |
| Node.js              | ≥20     | Entorno de desarrollo               |
| npm                  | ≥10     | Gestor de paquetes                  |

### Variable de entorno

```bash
VITE_API_URL=http://localhost:3000/api/v1   # URL base de la API Rails (sin trailing slash)
VITE_TENANT=norte                           # Tenant a emular en desarrollo (opcional)
```

Copiar `.env.example` a `.env` y completar los valores. `VITE_TENANT` sólo se usa cuando el host no nombra al tenant (`localhost`) y no hay `?tenant=` en la URL; en producción el slug sale siempre del subdominio.

---

## 3. Arquitectura feature-based

### 3.1 Estructura de carpetas

```
src/
├── app/                        # Configuración global de la aplicación
│   ├── layout/                 # Estructura visual principal
│   │   ├── AppLayout.tsx       # Layout raíz: Header + Sidebar + Outlet
│   │   ├── Header.tsx          # Cablea TopNavBar (shared/) con uiStore
│   │   └── Sidebar.tsx         # Drawer persistente de navegación
│   ├── providers/              # Providers globales
│   │   ├── Providers.tsx       # QueryClientProvider + BrowserRouter + ThemeWrapper + TenantGate
│   │   ├── TenantGate.tsx      # Gate de arranque: splash / tenant desconocido / app
│   │   └── ThemeWrapper.tsx    # ThemeProvider MUI + CssBaseline
│   ├── router/                 # Routing
│   │   ├── AppRouter.tsx       # Árbol de rutas con Suspense + AppLayout
│   │   └── routes.tsx          # Lazy imports de páginas
│   └── theme/                  # Tema MUI
│       └── theme.ts            # createAppTheme(branding): los dos esquemas (claro/oscuro) + marca del tenant
│
├── features/                   # Módulos de negocio (uno por feature)
│   └── [feature]/
│       ├── components/         # Componentes propios del feature
│       ├── hooks/              # Custom hooks del feature (data fetching, lógica local)
│       ├── pages/              # Página raíz de la ruta del feature
│       ├── types.ts            # Tipos TypeScript locales del feature
│       └── index.ts            # Barrel export (solo lo que otros módulos necesitan)
│
├── shared/                     # Código reutilizable entre features
│   ├── api/
│   │   ├── client.ts           # Instancia Axios configurada (baseURL, interceptors)
│   │   ├── count.ts            # fetchCount(endpoint, filters): meta.total de un listado, sin filas
│   │   ├── tenant.ts           # Frontera de GET /tenant-config (schema + fetch)
│   │   ├── types.ts            # ApiResponse<T>, PaginatedResponse<T>, ApiError
│   │   └── index.ts            # Barrel export
│   ├── components/
│   │   ├── LoadingSpinner.tsx  # CircularProgress centrado (prop: fullScreen)
│   │   ├── ErrorFallback.tsx   # Pantalla de error con botón Reintentar opcional
│   │   ├── PageWrapper.tsx     # Box con padding responsivo y maxWidth: 1200
│   │   └── index.ts            # Barrel export
│   ├── hooks/
│   │   ├── usePaginatedQuery.ts # Hook genérico para queries paginadas
│   │   └── useTenantConfig.ts   # Config del tenant al arrancar la app
│   ├── store/
│   │   ├── uiStore.ts          # Estado de UI (themeMode, sidebarOpen) con persist
│   │   ├── tenantStore.ts      # Slug + config del tenant activo, con persist
│   │   └── index.ts            # Barrel export
│   ├── types/
│   │   └── index.ts            # ID, Nullable<T>, Optional<T>, Option<T>, PaginationParams
│   └── utils/
│       ├── tenant.ts           # Resolución del slug (subdominio / override de dev)
│       └── index.ts            # formatDate, capitalize, sleep, isNonEmpty
│
└── tests/                      # Tests de integración / globales
```

### 3.2 Reglas de dependencia entre capas

```
features  →  shared       ✅ permitido
features  →  app          ❌ PROHIBIDO
shared    →  features     ❌ PROHIBIDO
shared    →  app          ❌ PROHIBIDO
app       →  features     ✅ solo en app/router/
app       →  shared       ✅ permitido
```

> Estas reglas se **enforcean por ESLint** (`@typescript-eslint/no-restricted-imports` en `eslint.config.js`), no solo por convención: un import que las viole falla el lint (y el CI). Dentro de una misma feature se usan rutas relativas; entre features/capas, los aliases.

### 3.3 Imports absolutos

`tsconfig.app.json` (`baseUrl: ./src`) y `vite.config.ts` (aliases) habilitan imports sin rutas relativas:

```ts
// ✅ Correcto
import { client } from 'shared/api/client'
import { useUiStore } from 'shared/store'
import { LoadingSpinner, PageWrapper } from 'shared/components'
import { formatDate } from 'shared/utils'

// ❌ Incorrecto
import { client } from '../../../shared/api/client'
```

Alias disponibles: `app/*`, `features/*`, `shared/*`

---

## 4. Capas en detalle

### 4.1 Capa `app/`

**Entry point:**

```
index.html → src/main.tsx → <Providers><App /></Providers>
```

- `main.tsx`: monta la app con `createRoot`, envuelve con `<StrictMode>` y `<Providers>`
- `App.tsx`: renderiza únicamente `<AppRouter />`

**Providers** — jerarquía (de afuera hacia adentro):

1. `QueryClientProvider` — React Query (`staleTime`: 5 min, `retry`: 1, `refetchOnWindowFocus`: false)
2. `BrowserRouter` — React Router
3. `ThemeWrapper` — MUI `ThemeProvider` + `CssBaseline`, con la marca del tenant activo
4. `TenantGate` — gate de arranque multi-tenant

**Multi-tenancy en el frontend** (TESIS-121; contrato en `plan-demo/CONTRATO-tenant.md`):

- El slug sale del subdominio (`norte.<dominio>` → `norte`). En `localhost` hay override de desarrollo: `?tenant=` > `VITE_TENANT` > `norte`. Vive en `shared/utils/tenant.ts`.
- `TenantGate` no monta la app hasta saber para qué empresa se sirve: mientras `GET /tenant-config` está en vuelo muestra un splash con la identidad derivada del slug —**nunca** el tema base genérico— y ante un slug irresoluble o un 404 muestra la pantalla de tenant desconocido.
- La config (branding + feature flags) vive en `tenantStore`, persistida por slug, y la trae `shared/hooks/useTenantConfig`.
- La diferenciación entre clientes es **config + flags**, nunca una rama de código por empresa.

**Router — registro único de rutas:**

- `routes.tsx`: **fuente única de verdad** de las rutas. Exporta `appRoutes` (array de `{ path, element, nav?, layout?, feature? }`, con las páginas cargadas vía `lazy()`), `navRoutesFor(features)` (las que tienen `nav` **y** cuya feature está habilitada para el tenant activo, ya angostadas para el Sidebar) y la partición `shellRoutes` / `bareRoutes` según `layout`. Sumar una ruta = agregar **una** entrada acá.
- **Rutas por feature flag (`feature`):** una ruta con `feature` sólo aparece en el Sidebar si la config del tenant la trae encendida, y `FeatureGate` la reemplaza por una pantalla de "no disponible" si se navega directo. Un flag ausente es un flag apagado.
- `AppRouter.tsx`: monta `bareRoutes` sueltas y públicas — cada una con su propio `ErrorBoundary` — y `shellRoutes` detrás de `<ProtectedRoute>` y dentro de `<AppLayout>`. Todo envuelto en `<Suspense fallback={<LoadingSpinner fullScreen />}>`. El catch-all vive dentro del guard, así una URL desconocida sin sesión también termina en el login.
- El Sidebar y el Router se derivan del mismo `routes.tsx`, por lo que no pueden divergir.
- **Rutas sin shell (`layout: 'bare'`):** públicas y full-bleed — hoy `/login`. No pasan por el guard ni renderizan Header/Sidebar. Como el `ErrorBoundary` de `AppLayout` sólo envuelve al `Outlet` privado, cada ruta bare lleva el suyo.
- `ProtectedRoute.tsx`: si no hay sesión válida redirige a `/login` guardando el destino pedido en `location.state.from`, para volver ahí después de ingresar.

**Layout:**

- `AppLayout.tsx`: flex `Header + Sidebar + <Outlet>`. El margen izquierdo responde a `sidebarOpen` del `uiStore` (drawer width: 240px). El `<Outlet>` va envuelto en `<ErrorBoundary key={pathname}>`: los errores de render (o de carga de un chunk lazy) muestran el `ErrorFallback` en el área de contenido sin tumbar Header ni Sidebar, y se limpian al navegar.
- `Header.tsx`: único punto de cableado del `TopNavBar` (`shared/components`) — lee `themeMode`/`toggleTheme`/`toggleSidebar` de `useUiStore` y el email + `logout` de `useAuthStore`, todo con selectores individuales, y se los pasa por props. El componente en sí es presentacional — sin datos ni `uiStore`; su único acople es el `Link` de react-router (brand y engranaje), correcto para esta app (ver tabla de `shared/` más abajo). El logout no navega: limpia la sesión y el guard hace el redirect.
- `Sidebar.tsx`: Drawer persistente. Los ítems salen de `navRoutesFor(features)` con los feature flags del tenant activo. Usa `NavLink` con clase `active` que resalta en `primary.main`.

**Tema** (`createAppTheme(branding)`):

- Un solo tema con los dos esquemas de color (`colorSchemes: { light, dark }`), armado por tenant y no por modo. `ThemeWrapper` lleva el modo de `uiStore` a MUI con `useColorScheme`, que cambia el atributo `data-light`/`data-dark` del `<html>`: el navegador repinta desde las variables CSS sin volver a generar estilos. Los estilos leen `theme.vars` y lo que cambia de forma entre modos va en `theme.applyStyles` (ADR-007, actualización de TESIS-104).
- `branding` trae el branding de cada esquema (el provisorio del slug cambia de tono por modo). El del tenant activo: `primary_color` y `accent_color` pisan el primario y el acento de la paleta (y el acento llega también al anillo de foco y al input enfocado). El resto de los tokens del DS no se toca. El texto sobre esos colores se calcula por contraste, no se fija por modo.
- Fuente: Inter con fallbacks al sistema
- `borderRadius`: 8px global
- Overrides: `MuiButton` sin elevation · `MuiCard` sin elevation, borde `1px solid`
- `MuiButton` suma la variante **`glass`**: relleno translúcido del propio tono + borde de un pelo, para la acción secundaria sobre superficies profundas. Se genera una entrada por intención, así `color` funciona igual que en las demás variantes (`variant="glass" color="neutral"`).
- Light: primary `#1976d2`, bg `#f5f5f5`
- Dark: primary `#90caf9`, bg `#121212`, paper `#1e1e1e`

---

### 4.2 Capa `shared/`

**Cliente HTTP** (`shared/api/client.ts`):

- `baseURL`: `import.meta.env.VITE_API_URL`
- Request interceptor: inyecta `Authorization: Bearer <token>` leyendo el token del `authStore` (no de `localStorage`, para no tener dos fuentes de verdad sobre la sesión), y `X-Tenant-Slug` con el slug del tenant activo en **todos** los requests — el backend lo ignora donde manda el JWT (§1 del contrato de tenant)
- Response interceptor: normaliza errores a `ApiRequestError`, que **conserva el `status`** para que cada feature elija su mensaje en vez de mostrar el texto crudo de la API
- **401**: limpia la sesión completa; el redirect lo hace el guard, así el interceptor no conoce el router. Sólo si el request salió con el token de la sesión abierta ahora: el 401 de un request que salió con otro token (una sesión que ya se cerró, en esta pestaña o en otra) no cierra la actual
- **403**: no desloguea — notifica "sin permisos" vía `notify()`

**Tipos de API** (`shared/api/types.ts`):

```ts
interface ApiResponse<T> {
  data: T
  message?: string
}

interface PaginatedResponse<T> {
  data: T[]
  meta: { currentPage: number; totalPages: number; totalCount: number; perPage: number }
}

interface ApiError {
  message: string
  status?: number
  errors?: Record<string, string[]>
}
```

**Tipos compartidos** (`shared/types/index.ts`):

```ts
type ID = string | number
type Nullable<T> = T | null
type Optional<T> = T | undefined
interface Option<T = string> {
  label: string
  value: T
}
interface PaginationParams {
  page: number
  perPage: number
}
```

**Componentes compartidos:**

| Componente                     | Props                                                      | Descripción                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| ------------------------------ | ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `LoadingSpinner`               | `fullScreen?: boolean`                                     | CircularProgress centrado. `fullScreen`: 100vh × 100%                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `ErrorBoundary`                | `children`                                                 | Class component que captura errores de render y muestra `ErrorFallback`. Cableado en `AppLayout` alrededor del `<Outlet>` y en cada ruta `bare`                                                                                                                                                                                                                                                                                                                                         |
| `ErrorFallback`                | `error?: Error`, `onRetry?: () => void`                    | Pantalla de error con botón Reintentar (presentacional)                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `PageWrapper`                  | `children`, `...BoxProps`                                  | `<main>` con `p: {xs:2, md:3}`, `maxWidth: 1200`, `mx: auto`                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `NotificationHost`             | —                                                          | Render único de las notificaciones del `notificationStore`. Montado en los providers; una a la vez. Cada una es un toast: el aviso del sistema del tema (`Alert`, ver `app/theme/components/alert.ts`) flotando, con fondo opaco y sombra de nivel 2. Ninguna pantalla monta un `Snackbar` propio: todo aviso pasa por `notify()`                                                                                                                                                       |
| `StatCard` / `CompactStatCard` | Ver `StatCard.types.ts`                                    | Tarjeta de KPI: ícono + chip de tendencia o etiqueta, valor destacado, aclaración opcional (`note`) y footer comparativo. `tone: 'error'` suma borde y halo de acento. `loading` reemplaza el valor por un skeleton de la misma altura. La variante condensada es una sola fila. Presentacionales: el valor llega ya formateado                                                                                                                                                         |
| `ProgressIndicator`            | Ver `ProgressIndicator.types.ts`                           | Barra lineal con tono semántico. `size` thin/medium/large, `layout` stacked/inline, `indeterminate` para progreso desconocido. El ancho sale del porcentaje                                                                                                                                                                                                                                                                                                                             |
| `StepsProgress`                | `total`, `completed`, `tone?`, `label?`, `caption?`        | Progreso por etapas discretas, para procesos con pasos nombrados                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `ProgressSkeleton`             | `label?`, `avatar?`, `lines?`                              | Placeholder de carga con la silueta del contenido que reemplaza                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `TopNavBar`                    | Ver `TopNavBar.types.ts`                                   | Shell de navegación global (brand + búsqueda + acciones + usuario). Presentacional — sin datos, sin `uiStore`; único acople: el `Link` de Router (brand/engranaje). Fixed/z-index intrínsecos vía `MuiAppBar` en el tema. Cableado real en `app/layout/Header.tsx`.                                                                                                                                                                                                                     |
| `StatusFeed`                   | Ver `StatusFeed.types.ts`                                  | Bitácora de eventos de alta densidad: barra fina como eje temporal, título y metadato en monoespaciada. `current` marca la entrada vigente; el resto se atenúa. Renderiza `<ol>` porque el orden es información                                                                                                                                                                                                                                                                         |
| `Logo`                         | `brand`, `tagline`                                         | Lockup de marca (isotipo + wordmark). Las reglas del manual viajan con el componente: área de respeto como padding propio y mínimo de 140px como `minWidth`                                                                                                                                                                                                                                                                                                                             |
| `LogoMark`                     | `size?: number`                                            | Isotipo suelto, inline y con `currentColor` para que herede el color del contenedor                                                                                                                                                                                                                                                                                                                                                                                                     |
| `DataTable`                    | Ver `DataTable.types.ts`                                   | Tabla genérica del DS: pestañas, selección, acciones por fila, paginación, `title` y `footer`. `density: 'compact'` baja la fila a 52px para las tablas que viven dentro de un formulario (líneas del alta manual). Presentacional: el formato de cada celda lo resuelve el `render` de su columna                                                                                                                                                                                      |
| `LabeledField`                 | `label`, `children`, `error?`, `helperText?`, `fullWidth?` | Campo con el rótulo arriba del input, como pide el DS (MUI lo flota en el borde). Renderiza `<label>` envolviendo al input, así los asocia sin `id`. Nació en los modales de producto y subió a `shared/` con el alta manual de órdenes (Regla de Dos)                                                                                                                                                                                                                                  |
| `StackedCell`                  | `primary`, `secondary?`                                    | Celda de dos líneas: el dato arriba y su contexto abajo, atenuado. Nació en el listado de órdenes y subió con la tabla de anomalías de Reportes (Regla de Dos). Sin `secondary` colapsa a una línea y la fila no cambia de alto                                                                                                                                                                                                                                                         |
| `ModalFrame`                   | Ver `ModalFrame.types.ts`                                  | Marco de todos los modales (ModalFrame del diseño): cabecera con título, subtítulo, ícono y cierre; debajo, `ModalBody` + `ModalFooter` (o un `ModalForm` que los envuelva, para los formularios). `size` sm 480 · md 672 · lg 880. Resuelve una vez lo que ningún modal debería repetir: sólo scrollea el cuerpo, el título va al `aria-labelledby` y con `busy` no se cierra por ningún lado. Nació en los modales de producto y subió a `shared/` con `ConfirmDialog` (Regla de Dos) |
| `ConfirmDialog`                | Ver `ConfirmDialog.types.ts`                               | Confirmación antes de una acción, sobre `ModalFrame` (`sm` por defecto). `tone: 'destructive'` suma la advertencia roja, pinta la confirmación en rojo y arranca con el foco en Cancelar. `canConfirm={false}` deja sólo la salida, para cuando el backend ya rechazó la acción; `children` lleva el motivo. Presentacional: quien lo monta ejecuta la acción                                                                                                                           |

**Stores globales** (`shared/store/`):

```ts
const { themeMode, toggleTheme, sidebarOpen, toggleSidebar, setSidebarOpen } = useUiStore()
const { token, user, isAuthenticated, login, logout } = useAuthStore()
const { slug, config, setConfig } = useTenantStore()
```

- `uiStore` — `themeMode` persiste en `localStorage` (clave `'ui-store'`); `sidebarOpen` no persiste.
- `authStore` — persiste **sólo** el token (clave `'auth-store'`); un token vencido o corrupto se descarta antes de arrancar. `user` es la identidad que devuelve `GET /me` (ver ADR-002) y no se persiste. El logout vacía también lo del usuario que se va: la cache de React Query y el borrador de la orden. `followSessionAcrossTabs()`, registrado en `main.tsx`, mantiene de acuerdo a las pestañas: si otra cierra sesión o entra con otra cuenta, ésta relee la sesión guardada y vacía lo del usuario anterior. Expone `getAuthToken()` y `clearSession()` para consumidores fuera de React, como el interceptor HTTP.
- `tenantStore` — `slug` (resuelto del host, no lo cambia la app) y `config` del tenant (clave `'tenant-store'`). La config persistida se restaura **sólo** si es del mismo slug, y se valida con el mismo schema que la respuesta del backend. Expone `useTenantName()` y `useTenantFeature(feature)` como selectores, y `setTenantConfig()` para escribirla desde afuera de React.
- `notificationStore` — cola de notificaciones con `notify(mensaje, severidad)`, también invocable fuera de React. La renderiza `NotificationHost`, montado una vez en los providers.
- `orderDraftStore` — borrador del alta manual de una orden (cliente, líneas, depósito de origen y domicilio de entrega), compartido por los tres pasos del asistente (`/orders/new`, S05 → S07). Persiste en **`sessionStorage`** (clave `'order-draft-store'`): un reload entre pasos no pierde lo cargado, pero un borrador a medias no reaparece días después en otra pestaña. `clearDraft()` al cancelar, al confirmar y al cerrar sesión (el logout lo vacía junto con la cache de React Query).

**Conteos sobre listados paginados** (`shared/api/count.ts`):

Los index de Rails nacen paginados y su `meta.total` cuenta el scope **ya filtrado**. Para mostrar
un número —KPIs del panel, contadores de pestañas— nunca se cuenta el `.length` del array (cuenta
la página, no el total, y cambia al paginar): se pide una sola fila y se lee el `meta.total`.

```ts
const pending = await fetchCount('/orders', { status: 'pending' })
// GET /orders?status=pending&page=1&per_page=1  →  meta.total
```

Un request por número, sin filas. La key de esa query cuelga de la raíz del recurso que cuenta
(`['orders', ...]`), así una mutación que invalide el dominio refresca también los contadores.

**Hook paginado** (`shared/hooks/usePaginatedQuery.ts`):

```ts
const { data, isLoading, isError } = usePaginatedQuery<Producto>({
  endpoint: '/productos',
  params: { page: 1, perPage: 10 },
})
// data: PaginatedResponse<Producto>
```

La `queryKey` se construye como `[endpoint, params]`, por lo que cambios en `params` disparan refetch automático.

---

### 4.3 Capa `features/`

Cada feature es autocontenido:

```
features/[nombre]/
├── components/     # Componentes de UI del feature
├── hooks/          # Data fetching y lógica local (useQuery/useMutation wrapeados)
├── pages/          # Componente raíz de la ruta
├── types.ts        # Interfaces y tipos locales
└── index.ts        # Barrel: solo exporta lo que otros módulos necesitan
```

**Features existentes:**

| Feature         | Contenido                                                                                                                                                                                                                                                                                                                                                                              |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `dashboard`     | Panel de operación (`/dashboard`) y la sección de Integraciones (`/integrations`, detrás del feature flag `integrations` del tenant). Comparten `useInfraHealth` e `IntegrationNodeList`. El panel suma la tarjeta de alertas de inventario, la carga por depósito y la tabla de órdenes recientes (`useInventoryAlerts`, `WarehouseLoadCard`, `useRecentOrders`, `RecentOrdersTable`) |
| `design-system` | Catálogo de tokens y componentes del DS (`/design-system`). No tiene datos ni hooks                                                                                                                                                                                                                                                                                                    |
| `home`          | Landing de la app (`/`)                                                                                                                                                                                                                                                                                                                                                                |
| `inventory`     | Catálogo de productos y stock por depósito (`/inventory`). Hoy el alta y la edición de producto (`CreateProductModal`, `EditProductModal`) sobre la API real; la vista real del catálogo la construye TESIS-62, que reemplaza el cuerpo de `InventoryPage`                                                                                                                             |
| `orders`        | Listado global de órdenes (`/orders`), el detalle de una orden con el ciclo de vida de su envío (`/orders/:orderId`), su modificación (`/orders/edit/:orderId`) y los pasos 1 y 2 del alta manual (`/orders/new`: cliente y productos; `/orders/new/shipping`: origen y destino; el paso 3 es TESIS-59)                                                                                |
| `reports`       | Reportes — analítica de la operación (`/reports`, S14): métricas del período, curva de despacho, nivel de servicio por operador y anomalías recientes. **Sin endpoint de agregados todavía**: la pantalla muestra el dataset de muestra del diseño y lo dice junto al título (ver `api.ts`)                                                                                            |

**`orders` — piezas y por qué:**

| Archivo                               | Rol                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `api.ts`                              | Frontera con Rails. Además de traducir el `snake_case`, resuelve el envío de una orden: `GET /shipments?order_id=` dice cuántos hay y `GET /shipments/:id` trae la bitácora, que el listado no incluye                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `utils/shipment.ts`                   | Reglas del ciclo de vida: qué etapa está vigente, cuándo entró en cada una y qué badge muestra el encabezado. El estado vigente sale del envío y no del último evento, que puede llegar desordenado                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `utils/payment.ts`                    | Las cuentas del detalle, en centavos para que sumar importes no deje restos de punto flotante. El subtotal es el `total_amount` persistido (TESIS-114), no la suma de las líneas recalculada                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `components/InfoPanel/`               | Panel lateral de pares rótulo-valor, compartido por los datos del cliente y los del envío. Se extrajo al aparecer el **segundo** consumidor, no antes — `feature-structure.md` §6                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `components/ShipmentStateMessage.tsx` | Lo que muestran los paneles del envío cuando no hay uno que dibujar (sin envío, envío duplicado, cargando, error). Lo comparten el ciclo de vida y los datos del envío, así los dos dicen lo mismo                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `utils/draft.ts`                      | Reglas del paso 1 del alta manual: el filtro del buscador (SKU o nombre, en memoria), qué línea es válida, los totales del borrador y cuándo se habilita «Siguiente» (`canProceed`). Puras, para probarlas sin montar la pantalla                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `components/ProductPicker/`           | Buscador + cantidad + precio unitario para sumar un SKU al borrador. `GET /products` no busca, así que trae una página (100, el máximo) y filtra del lado del cliente. No hay precio de lista en `products`: el precio se carga a mano                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `utils/shipping.ts`                   | Reglas del paso 2: qué depósito cubre el borrador entero (`warehouseCoverage`) y los dos requests que hará el paso 3 con lo elegido (`toCreateOrderPayload`, `toQuotePayload`). La orden sale de un solo depósito: el `warehouse_id` es el mismo en todas las líneas                                                                                                                                                                                                                                                                                                                                                                                                   |
| `components/OriginWarehousePicker/`   | Los depósitos como tarjetas elegibles (grupo de radios), cada una con su nivel de stock para el borrador. Un depósito que no cubre la orden entera queda deshabilitado, con el motivo en su descripción accesible. El stock por depósito sale de `GET /products/:id`, uno por línea: el listado del catálogo no trae el desglose                                                                                                                                                                                                                                                                                                                                       |
| `components/DestinationFieldsCard/`   | Domicilio de entrega: calle, ciudad, provincia y código postal (TESIS-128). La provincia se elige de `GET /orders/provinces`, no de una lista escrita en el front: tiene que coincidir con la que valida el backend                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `utils/edit.ts`                       | Reglas de la modificación: qué líneas quedan fijas (las anteriores a TESIS-126 no saben de qué depósito salieron), cuáles piden más stock del libre —con la misma cuenta neta que el backend, que devuelve antes de descontar—, si las líneas cambiaron (sin cambios, el `PUT` no manda `items` y no toca stock) y el body del `PUT`                                                                                                                                                                                                                                                                                                                                   |
| `components/OrderEditForm/`           | El formulario de S09. Dos formularios de React Hook Form (datos de la orden y domicilio) y las líneas en estado local, guardados juntos en un `PUT` con `If-Match`. La versión que viaja en `If-Match` es la que se leyó al montar, congelada: un refetch en segundo plano no la puede reemplazar sin que el guardado deje de detectar el cambio de otro operador. El formulario no se remonta cuando cambia la versión (guardar la cambia, y remontar descartaría el callback que lleva al detalle); sólo cuando el operador recarga después de un 412. La regla de cuándo una orden no se edita (cancelada, o con el envío ya salido) es la de `Orders::UpdateOrder` |
| `components/EditLinesTable/`          | Las líneas en edición, con cantidad `−` / `+` y quitar como columna propia: el menú de acciones de `DataTable` no se apaga por fila, y una línea fija no se puede quitar                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `components/FormSection/`             | Tarjeta de sección con ícono y título de los formularios del alta. Se extrajo cuando el paso 2 la necesitó dos veces                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `components/DraftItemsTable/`         | Las líneas cargadas, sobre `DataTable` compacta, con la cantidad editable en la fila. El buscador va en su barra, como «Agregar SKU» en S05                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |

**`reports` — piezas y por qué:**

| Archivo                         | Rol                                                                                                                                                                                                                                                                                                                                    |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `api.ts`                        | Frontera con la API de reportes. El endpoint de agregados **no existe** (seis de los siete bloques de S14 no tienen dominio detrás, y los listados no filtran por fecha), así que hoy resuelve `sampleData.ts`. Es el único archivo que cambia cuando Rails lo exponga; `REPORTS_DATA_IS_SAMPLE` enciende el distintivo de la pantalla |
| `types.ts`                      | El contrato que ese endpoint tendrá que cumplir: `ReportsOverview` con las cuatro métricas (`TrendedValue`, con `trend: null` cuando no hay período anterior), la curva con sus dos series, el nivel de servicio por operador y las anomalías                                                                                          |
| `hooks/useReportsOverview.ts`   | Una sola consulta por período y no una por bloque: el endpoint va a calcular todo sobre la misma ventana, y pedirlo junto garantiza que tarjetas, curva y tabla hablen del mismo período                                                                                                                                               |
| `utils/chart.ts`                | Geometría de la curva: techo «redondo» del eje (1, 2, 4 o 10 por magnitud, para que los ticks salgan enteros), posición de cada punto y suavizado Catmull-Rom → Bézier. Puras, para probarlas sin montar un SVG                                                                                                                        |
| `utils/format.ts`               | `k` y `MM` en vez de la notación compacta de `Intl`: son las abreviaturas del diseño y las que usa la operación para hablar de millones de pesos                                                                                                                                                                                       |
| `utils/status.ts`               | Umbrales provisorios del nivel de servicio (98 / 95 / 90) que reproducen los tonos del diseño hasta que el dominio modele un acuerdo de nivel de servicio; y el badge y énfasis de fila de cada estado de anomalía                                                                                                                     |
| `components/DispatchCurveCard/` | La curva sobre un SVG propio: no hay librería de gráficos en el stack y un solo gráfico no la justifica. El segmentado «Órdenes / Facturación» (`ToggleButtonGroup`, tematizado en `app/theme/components/toggleButton.ts`) es estado de la tarjeta                                                                                     |
| `components/ServiceLevelCard/`  | Una fila por operador con `ProgressIndicator` de canal neutro, así las barras se comparan entre sí. Renderiza `<ol>` porque el orden es un ranking                                                                                                                                                                                     |
| `components/AnomaliesTable/`    | Sobre `DataTable`. El incidente no se pinta como enlace aunque el diseño lo haga: no hay pantalla de incidente a la que llevar. «Ver bitácora completa» queda visible y apagada, como el remito del detalle de orden                                                                                                                   |
| `components/ReportsHeader/`     | Título, distintivo de «Datos de muestra», selector de período (`Menu`) y la exportación apagada: además de no tener endpoint, la decisión del proyecto es dejar la exportación para el final, cuando el modelo de datos esté completo                                                                                                  |

**`inventory` — piezas y por qué:**

| Archivo                          | Rol                                                                                                                                                                                                                                                |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `components/EditProductModal/`   | Modal de edición: datos básicos, medidas y asignación de stock. **Presentacional** — recibe `product` y `warehouses` ya resueltos y devuelve en `onSubmit` el cuerpo de `PUT /api/v1/products/:id`. Quien lo monta decide de dónde salen los datos |
| `components/CreateProductModal/` | Modal de alta, mismo contrato: devuelve el cuerpo de `POST /api/v1/products`. Valida depósitos repetidos en el schema y resalta el campo `sku` cuando la API rechaza el alta por SKU duplicado                                                     |
| `api.ts`                         | Frontera con Rails y único lugar que conoce el `snake_case`. También documenta que el index envuelve en `{ data, meta }` y usa `ProductListSerializer` (sin `stocks`), mientras `show`/`update` devuelven el objeto pelado                         |
| `utils/dimensions.ts`            | `products.dimensions` es un único `string` en la API y el diseño lo edita en tres ejes. Define el formato canónico (`"45x30x30"`, cm) y es el único lugar que lo conoce                                                                            |
| `utils/payload.ts`               | Traduce el formulario al cuerpo de la API. Funciones puras, aparte del componente, porque concentran las reglas no obvias (ver abajo) y así se pueden verificar solas                                                                              |

> El diálogo en sí se tematizó en `app/theme/components/dialog.ts` (`MuiDialog` en el nivel 3 de la escala de elevación + `MuiBackdrop` con scrim y blur), no dentro del modal: es un componente base de MUI y sus estilos van al tema — ver `component-structure.md` §3.1.

> **Tres reglas del submit que no se ven en el diseño**, todas en `utils/payload.ts`:
>
> 1. **Quitar un depósito viaja como `quantity: 0`, no como una omisión.** `Products::UpdateProduct` en el backend hace upsert por `warehouse_id` y **nunca destruye**: si el depósito no viene en el array, la fila queda viva con su cantidad anterior. Omitirlo haría que el usuario vea que borró y el stock siga ahí.
> 2. **`description` se reenvía tal cual.** El modal no la edita; mandarla explícita evita depender de que el backend la deje intacta.
> 3. **Una `dimensions` fuera de formato se conserva.** Un valor viejo (`"grande"`) se muestra como 0/0/0 porque no se puede representar en tres campos; guardar `null` ahí borraría un dato que el usuario nunca vio.

**Query keys — factory por feature (`queryKeys.ts`):**

Cada feature centraliza sus keys de React Query en `queryKeys.ts`, nunca literales sueltos en los hooks. Así las invalidaciones son consistentes a medida que aparecen mutaciones:

```ts
// features/[nombre]/queryKeys.ts
export const entidadKeys = {
  all: ['entidades'] as const,
  lists: () => [...entidadKeys.all, 'list'] as const,
  detail: (id: number) => [...entidadKeys.all, 'detail', id] as const,
}
```

**Patrón de data hook:**

```ts
export function useEntidades() {
  return useQuery<Entidad[]>({
    queryKey: entidadKeys.lists(),
    queryFn: async () => {
      const { data } = await client.get<ApiResponse<Entidad[]>>('/entidades')
      return data.data
    },
  })
}
```

> **Regla:** nunca usar `useEffect` + `useState` para fetch de datos. Siempre `useQuery` / `useMutation`.
> Para invalidar todo el dominio: `queryClient.invalidateQueries({ queryKey: entidadKeys.all })`.

---

## 5. Cómo agregar nuevas funcionalidades

### Nuevo feature

1. Crear `src/features/[nombre]/` con la estructura estándar
2. Definir tipos en `types.ts`
3. Definir las query keys en `queryKeys.ts`
4. Crear hook en `hooks/use[Nombre].ts` con `useQuery`
5. Crear página en `pages/[Nombre]Page.tsx` usando `PageWrapper`
6. Exportar desde `index.ts`
7. Agregar **una** entrada a `appRoutes` en `app/router/routes.tsx` (`{ path, element, nav? }`). Con `nav` aparece en el Sidebar; el Router se actualiza solo. No hace falta tocar `AppRouter.tsx` ni `Sidebar.tsx`.

### Nuevo store Zustand

1. Crear `src/shared/store/[dominio]Store.ts`
2. Exportar desde `src/shared/store/index.ts`
3. Para persistencia en `localStorage`: usar middleware `persist` (referencia: `uiStore.ts`)
   - Solo persistir los campos necesarios con `partialize`

### Nueva llamada a la API

```ts
// ✅ Patrón correcto — siempre dentro de un custom hook
import { useQuery } from '@tanstack/react-query'
import { client } from 'shared/api/client'
import type { ApiResponse } from 'shared/api/types'
import type { MiEntidad } from '../types'

export function useMiEntidad(id: number) {
  return useQuery<MiEntidad>({
    queryKey: ['mi-entidad', id],
    queryFn: async () => {
      const { data } = await client.get<ApiResponse<MiEntidad>>(`/entidades/${id}`)
      return data.data
    },
  })
}
```
