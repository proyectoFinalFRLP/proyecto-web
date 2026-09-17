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
│       └── theme.ts            # createAppTheme(mode, branding?): 'light' | 'dark' + marca del tenant
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

**Tema** (`createAppTheme(mode, branding?)`):

- `branding` es el del tenant activo: `primary_color` y `accent_color` pisan el primario y el acento de la paleta (y el acento llega también al anillo de foco y al input enfocado). El resto de los tokens del DS no se toca. El texto sobre esos colores se calcula por contraste, no se fija por modo.
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
- **401**: limpia la sesión completa; el redirect lo hace el guard, así el interceptor no conoce el router
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

| Componente                     | Props                                               | Descripción                                                                                                                                                                                                                                                         |
| ------------------------------ | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `LoadingSpinner`               | `fullScreen?: boolean`                              | CircularProgress centrado. `fullScreen`: 100vh × 100%                                                                                                                                                                                                               |
| `ErrorBoundary`                | `children`                                          | Class component que captura errores de render y muestra `ErrorFallback`. Cableado en `AppLayout` alrededor del `<Outlet>` y en cada ruta `bare`                                                                                                                     |
| `ErrorFallback`                | `error?: Error`, `onRetry?: () => void`             | Pantalla de error con botón Reintentar (presentacional)                                                                                                                                                                                                             |
| `PageWrapper`                  | `children`, `...BoxProps`                           | `<main>` con `p: {xs:2, md:3}`, `maxWidth: 1200`, `mx: auto`                                                                                                                                                                                                        |
| `NotificationHost`             | —                                                   | Render único de las notificaciones del `notificationStore`. Montado en los providers; una a la vez. Usa `Snackbar` + `Alert` de MUI hasta que TESIS-68 defina el Toast del DS                                                                                       |
| `StatCard` / `CompactStatCard` | Ver `StatCard.types.ts`                             | Tarjeta de KPI: ícono + chip de tendencia o etiqueta, valor destacado y footer comparativo. `tone: 'error'` suma borde y halo de acento. La variante condensada es una sola fila. Presentacionales: el valor llega ya formateado                                    |
| `ProgressIndicator`            | Ver `ProgressIndicator.types.ts`                    | Barra lineal con tono semántico. `size` thin/medium/large, `layout` stacked/inline, `indeterminate` para progreso desconocido. El ancho sale del porcentaje                                                                                                         |
| `StepsProgress`                | `total`, `completed`, `tone?`, `label?`, `caption?` | Progreso por etapas discretas, para procesos con pasos nombrados                                                                                                                                                                                                    |
| `ProgressSkeleton`             | `label?`, `avatar?`, `lines?`                       | Placeholder de carga con la silueta del contenido que reemplaza                                                                                                                                                                                                     |
| `TopNavBar`                    | Ver `TopNavBar.types.ts`                            | Shell de navegación global (brand + búsqueda + acciones + usuario). Presentacional — sin datos, sin `uiStore`; único acople: el `Link` de Router (brand/engranaje). Fixed/z-index intrínsecos vía `MuiAppBar` en el tema. Cableado real en `app/layout/Header.tsx`. |
| `StatusFeed`                   | Ver `StatusFeed.types.ts`                           | Bitácora de eventos de alta densidad: barra fina como eje temporal, título y metadato en monoespaciada. `current` marca la entrada vigente; el resto se atenúa. Renderiza `<ol>` porque el orden es información                                                     |
| `Logo`                         | `brand`, `tagline`                                  | Lockup de marca (isotipo + wordmark). Las reglas del manual viajan con el componente: área de respeto como padding propio y mínimo de 140px como `minWidth`                                                                                                         |
| `LogoMark`                     | `size?: number`                                     | Isotipo suelto, inline y con `currentColor` para que herede el color del contenedor                                                                                                                                                                                 |

**Stores globales** (`shared/store/`):

```ts
const { themeMode, toggleTheme, sidebarOpen, toggleSidebar, setSidebarOpen } = useUiStore()
const { token, user, isAuthenticated, login, logout } = useAuthStore()
const { slug, config, setConfig } = useTenantStore()
```

- `uiStore` — `themeMode` persiste en `localStorage` (clave `'ui-store'`); `sidebarOpen` no persiste.
- `authStore` — persiste **sólo** token y email (clave `'auth-store'`). `user` (id + `companyId`) se **deriva del JWT** al rehidratar, así no puede quedar desincronizado, y un token vencido o corrupto se descarta antes de arrancar. Expone `getAuthToken()` y `clearSession()` para consumidores fuera de React, como el interceptor HTTP.
- `tenantStore` — `slug` (resuelto del host, no lo cambia la app) y `config` del tenant (clave `'tenant-store'`). La config persistida se restaura **sólo** si es del mismo slug, y se valida con el mismo schema que la respuesta del backend. Expone `useTenantName()` y `useTenantFeature(feature)` como selectores, y `setTenantConfig()` para escribirla desde afuera de React.
- `notificationStore` — cola de notificaciones con `notify(mensaje, severidad)`, también invocable fuera de React. La renderiza `NotificationHost`, montado una vez en los providers.

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

| Feature         | Contenido                                                                                                                                                                                                                                                  |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `dashboard`     | Panel de operación (`/dashboard`) y la sección de Integraciones (`/integrations`, detrás del feature flag `integrations` del tenant). Comparten `useInfraHealth` e `IntegrationNodeList`                                                                   |
| `design-system` | Catálogo de tokens y componentes del DS (`/design-system`). No tiene datos ni hooks                                                                                                                                                                        |
| `home`          | Landing de la app (`/`)                                                                                                                                                                                                                                    |
| `inventory`     | Catálogo de productos y stock por depósito (`/inventory`). Hoy el alta y la edición de producto (`CreateProductModal`, `EditProductModal`) sobre la API real; la vista real del catálogo la construye TESIS-62, que reemplaza el cuerpo de `InventoryPage` |

**`inventory` — piezas y por qué:**

| Archivo                          | Rol                                                                                                                                                                                                                                                |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `components/ProductModalShell/`  | Cáscara compartida por los dos modales de producto: raíz, formulario, header, body, footer y el campo con rótulo. Se extrajo al aparecer el **segundo** consumidor, no antes — `feature-structure.md` §6                                           |
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
