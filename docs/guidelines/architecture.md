# Arquitectura del proyecto

## 1. Descripción general

Frontend de trabajo final de la carrera de Ingeniería en Sistemas de Información (FRLP). SPA construida en React que consume una API REST en Ruby on Rails.

**Repositorio:** `proyectoFinalFRLP/proyecto-web`  
**Gestor de tareas:** Jira (proyecto `TESIS`)

---

## 2. Stack tecnológico

| Tecnología | Versión | Rol |
|---|---|---|
| React | 19 | Biblioteca de UI |
| TypeScript | ~5.9 | Tipado estático |
| Vite | 8 | Bundler y dev server |
| MUI (Material UI) | 7 | Componentes de UI y theming |
| Emotion | 11 | Motor CSS-in-JS (requerido por MUI) |
| React Router | 7 | Routing client-side |
| Zustand | 5 | Estado global (UI state) |
| TanStack React Query | 5 | Estado del servidor / data fetching |
| Axios | 1 | Cliente HTTP |
| React Hook Form | 7 | Gestión de formularios |
| Zod | 4 | Validación de schemas y tipos |
| Node.js | ≥20 | Entorno de desarrollo |
| npm | ≥10 | Gestor de paquetes |

### Variable de entorno

```bash
VITE_API_URL=http://localhost:3000/api/v1   # URL base de la API Rails (sin trailing slash)
```

Copiar `.env.example` a `.env` y completar el valor.

---

## 3. Arquitectura feature-based

### 3.1 Estructura de carpetas

```
src/
├── app/                        # Configuración global de la aplicación
│   ├── layout/                 # Estructura visual principal
│   │   ├── AppLayout.tsx       # Layout raíz: Header + Sidebar + Outlet
│   │   ├── Header.tsx          # AppBar fija con toggle de tema y sidebar
│   │   └── Sidebar.tsx         # Drawer persistente de navegación
│   ├── providers/              # Providers globales
│   │   ├── Providers.tsx       # QueryClientProvider + BrowserRouter + ThemeWrapper
│   │   └── ThemeWrapper.tsx    # ThemeProvider MUI + CssBaseline
│   ├── router/                 # Routing
│   │   ├── AppRouter.tsx       # Árbol de rutas con Suspense + AppLayout
│   │   └── routes.tsx          # Lazy imports de páginas
│   └── theme/                  # Tema MUI
│       └── theme.ts            # createAppTheme(mode): 'light' | 'dark'
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
│   │   ├── types.ts            # ApiResponse<T>, PaginatedResponse<T>, ApiError
│   │   └── index.ts            # Barrel export
│   ├── components/
│   │   ├── LoadingSpinner.tsx  # CircularProgress centrado (prop: fullScreen)
│   │   ├── ErrorFallback.tsx   # Pantalla de error con botón Reintentar opcional
│   │   ├── PageWrapper.tsx     # Box con padding responsivo y maxWidth: 1200
│   │   └── index.ts            # Barrel export
│   ├── hooks/
│   │   └── usePaginatedQuery.ts # Hook genérico para queries paginadas
│   ├── store/
│   │   ├── uiStore.ts          # Estado de UI (themeMode, sidebarOpen) con persist
│   │   └── index.ts            # Barrel export
│   ├── types/
│   │   └── index.ts            # ID, Nullable<T>, Optional<T>, Option<T>, PaginationParams
│   └── utils/
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
3. `ThemeWrapper` — MUI `ThemeProvider` + `CssBaseline`

**Router:**
- `routes.tsx`: lazy imports de cada página con `lazy(() => import(...).then(...))`
- `AppRouter.tsx`: todas las rutas anidadas bajo `<AppLayout>`, envueltas en `<Suspense fallback={<LoadingSpinner fullScreen />}>`. Las rutas 404 redirigen a `/`.

**Layout:**
- `AppLayout.tsx`: flex `Header + Sidebar + <Outlet>`. El margen izquierdo responde a `sidebarOpen` del `uiStore` (drawer width: 240px).
- `Header.tsx`: AppBar fija (`zIndex: drawer + 1`). Toggle de sidebar (MenuIcon) y toggle de tema (Brightness icons). Ambos desde `useUiStore`.
- `Sidebar.tsx`: Drawer persistente con `navItems` estático. Usa `NavLink` con clase `active` que resalta en `primary.main`.

**Tema** (`createAppTheme(mode)`):
- Fuente: Inter con fallbacks al sistema
- `borderRadius`: 8px global
- Overrides: `MuiButton` sin elevation · `MuiCard` sin elevation, borde `1px solid`
- Light: primary `#1976d2`, bg `#f5f5f5`
- Dark: primary `#90caf9`, bg `#121212`, paper `#1e1e1e`

---

### 4.2 Capa `shared/`

**Cliente HTTP** (`shared/api/client.ts`):
- `baseURL`: `import.meta.env.VITE_API_URL`
- Request interceptor: inyecta `Authorization: Bearer <token>` desde `localStorage`
- Response interceptor: normaliza errores → `Error(message)`. Si 401: limpia el token.

**Tipos de API** (`shared/api/types.ts`):

```ts
interface ApiResponse<T> { data: T; message?: string }

interface PaginatedResponse<T> {
  data: T[]
  meta: { currentPage: number; totalPages: number; totalCount: number; perPage: number }
}

interface ApiError { message: string; status?: number; errors?: Record<string, string[]> }
```

**Tipos compartidos** (`shared/types/index.ts`):

```ts
type ID = string | number
type Nullable<T> = T | null
type Optional<T> = T | undefined
interface Option<T = string> { label: string; value: T }
interface PaginationParams { page: number; perPage: number }
```

**Componentes compartidos:**

| Componente | Props | Descripción |
|---|---|---|
| `LoadingSpinner` | `fullScreen?: boolean` | CircularProgress centrado. `fullScreen`: 100vh × 100% |
| `ErrorFallback` | `error?: Error`, `onRetry?: () => void` | Pantalla de error con botón Reintentar |
| `PageWrapper` | `children`, `...BoxProps` | `<main>` con `p: {xs:2, md:3}`, `maxWidth: 1200`, `mx: auto` |

**Store global** (`shared/store/uiStore.ts`):

```ts
const { themeMode, toggleTheme, sidebarOpen, toggleSidebar, setSidebarOpen } = useUiStore()
```

- `themeMode`: persiste en `localStorage` (clave `'ui-store'`)
- `sidebarOpen`: no persiste — se resetea al recargar

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

**Patrón de data hook:**

```ts
export function useEntidades() {
  return useQuery<Entidad[]>({
    queryKey: ['entidades'],
    queryFn: async () => {
      const { data } = await client.get<ApiResponse<Entidad[]>>('/entidades')
      return data.data
    },
  })
}
```

> **Regla:** nunca usar `useEffect` + `useState` para fetch de datos. Siempre `useQuery` / `useMutation`.

---

## 5. Cómo agregar nuevas funcionalidades

### Nuevo feature

1. Crear `src/features/[nombre]/` con la estructura estándar
2. Definir tipos en `types.ts`
3. Crear hook en `hooks/use[Nombre].ts` con `useQuery`
4. Crear página en `pages/[Nombre]Page.tsx` usando `PageWrapper`
5. Exportar desde `index.ts`
6. Registrar en `app/router/routes.tsx` (lazy import) y `app/router/AppRouter.tsx` (`<Route>`)
7. Agregar link en `app/layout/Sidebar.tsx` → array `navItems`

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
