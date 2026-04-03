# proyecto-web

Frontend de la aplicación web desarrollada como trabajo final de la carrera de Ingeniería en Sistemas de Información. Construido con React + TypeScript y diseñado para consumir una API REST en Ruby on Rails.

## Stack

| Tecnología | Rol |
|------------|-----|
| [React 19](https://react.dev/) | Biblioteca de UI |
| [TypeScript 5](https://www.typescriptlang.org/) | Tipado estático |
| [Vite 8](https://vite.dev/) | Bundler y dev server |
| [MUI 7](https://mui.com/) | Componentes de UI |
| [React Router 7](https://reactrouter.com/) | Routing |
| [Zustand 5](https://zustand-demo.pmnd.rs/) | Estado global |
| [TanStack React Query 5](https://tanstack.com/query) | Estado del servidor / data fetching |
| [Axios](https://axios-http.com/) | Cliente HTTP |
| [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) | Formularios y validación |

> Las decisiones de arquitectura están documentadas en [`docs/adr/`](./docs/adr/).

---

## Requisitos

- Node.js >= 20
- npm >= 10

---

## Instalación y puesta en marcha

```bash
# 1. Clonar el repositorio
git clone <url-del-repo>
cd proyecto-web

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env y configurar VITE_API_URL con la URL de la API Rails
# Ejemplo: VITE_API_URL=http://localhost:3000/api/v1

# 4. Iniciar el servidor de desarrollo
npm run dev
```

La app estará disponible en [http://localhost:5173](http://localhost:5173).

---

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia el servidor de desarrollo con HMR |
| `npm run build` | Compila TypeScript y genera el bundle de producción en `dist/` |
| `npm run lint` | Ejecuta ESLint sobre todo el proyecto |
| `npm run preview` | Sirve el bundle de producción localmente |

---

## Arquitectura

El proyecto sigue una **arquitectura feature-based** organizada en tres capas principales.

```
src/
├── app/                        # Configuración global de la aplicación
│   ├── layout/                 # Estructura visual: Header, Sidebar, AppLayout
│   ├── providers/              # Providers globales (QueryClient, Theme, Router)
│   ├── router/                 # Definición de rutas y AppRouter
│   └── theme/                  # Configuración del tema MUI (light/dark)
│
├── features/                   # Módulos de negocio (uno por feature)
│   └── [nombre-feature]/
│       ├── components/         # Componentes propios del feature
│       ├── hooks/              # Custom hooks del feature
│       ├── pages/              # Páginas (componentes raíz de ruta)
│       ├── types.ts            # Tipos TypeScript del feature
│       └── index.ts            # Barrel export
│
├── shared/                     # Código reutilizable entre features
│   ├── api/                    # Cliente Axios y tipos de respuesta de la API
│   ├── components/             # Componentes reutilizables (LoadingSpinner, etc.)
│   ├── hooks/                  # Custom hooks genéricos
│   ├── store/                  # Stores Zustand globales
│   ├── types/                  # Tipos TypeScript compartidos
│   └── utils/                  # Funciones utilitarias
│
└── tests/                      # Tests de integración / globales
```

### Reglas de dependencia entre capas

```
features  →  shared       ✅ permitido
features  →  app          ❌ prohibido
shared    →  features     ❌ prohibido
shared    →  app          ❌ prohibido
app       →  features     ✅ solo en router/
app       →  shared       ✅ permitido
```

Esto garantiza que `shared/` sea verdaderamente reutilizable y que los features sean autocontenidos.

### Sistema de imports absolutos

`tsconfig.app.json` tiene `"baseUrl": "./src"`, lo que permite imports sin rutas relativas:

```ts
// ✅ Así
import { client } from 'shared/api/client'
import { useUiStore } from 'shared/store'
import { LoadingSpinner } from 'shared/components'

// ❌ No así
import { client } from '../../../shared/api/client'
```

---

## Guías de trabajo

### Agregar un nuevo feature

1. Crear la carpeta en `src/features/nombre-feature/` con la siguiente estructura:

```
features/nombre-feature/
├── components/
├── hooks/
├── pages/
│   └── NombreFeaturePage.tsx
├── types.ts
└── index.ts
```

2. Definir los tipos locales en `types.ts`:

```ts
// features/nombre-feature/types.ts
export interface Producto {
  id: number
  nombre: string
  precio: number
}
```

3. Crear un hook de data fetching en `hooks/`:

```ts
// features/nombre-feature/hooks/useProductos.ts
import { useQuery } from '@tanstack/react-query'
import { client } from 'shared/api/client'
import type { ApiResponse } from 'shared/api/types'
import type { Producto } from '../types'

export function useProductos() {
  return useQuery<Producto[]>({
    queryKey: ['productos'],
    queryFn: async () => {
      const { data } = await client.get<ApiResponse<Producto[]>>('/productos')
      return data.data
    },
  })
}
```

4. Crear la página en `pages/`:

```tsx
// features/nombre-feature/pages/NombreFeaturePage.tsx
import { PageWrapper } from 'shared/components'
import { LoadingSpinner } from 'shared/components/LoadingSpinner'
import { useProductos } from '../hooks/useProductos'

export function NombreFeaturePage() {
  const { data, isLoading } = useProductos()
  if (isLoading) return <LoadingSpinner />
  return (
    <PageWrapper>
      {/* contenido */}
    </PageWrapper>
  )
}
```

5. Exportar desde `index.ts`:

```ts
// features/nombre-feature/index.ts
export { NombreFeaturePage } from './pages/NombreFeaturePage'
```

6. Registrar la ruta (ver sección siguiente).

---

### Agregar una nueva ruta

Las rutas se definen en dos archivos dentro de `src/app/router/`:

**`routes.tsx`** — registrar el lazy import:

```tsx
export const NombreFeaturePageLazy = lazy(() =>
  import('features/nombre-feature').then((m) => ({ default: m.NombreFeaturePage })),
)
```

**`AppRouter.tsx`** — agregar el `<Route>`:

```tsx
<Route path="/nombre-feature" element={<NombreFeaturePageLazy />} />
```

**`Sidebar.tsx`** — agregar el link de navegación:

```tsx
const navItems = [
  { label: 'Inicio', path: '/', icon: <HomeIcon /> },
  { label: 'Nombre Feature', path: '/nombre-feature', icon: <TuIcono /> },
]
```

---

### Agregar un nuevo store Zustand

Los stores globales viven en `src/shared/store/`. Cada dominio de estado tiene su propio archivo.

```ts
// shared/store/miStore.ts
import { create } from 'zustand'

interface MiState {
  valor: string
  setValor: (v: string) => void
}

export const useMiStore = create<MiState>()((set) => ({
  valor: '',
  setValor: (v) => set({ valor: v }),
}))
```

Luego exportarlo desde `shared/store/index.ts`:

```ts
export { useMiStore } from './miStore'
```

> Para persistir estado en `localStorage`, usar el middleware `persist` de Zustand (ver `uiStore.ts` como referencia).

---

### Consumir la API

El cliente HTTP está configurado en `src/shared/api/client.ts`. Ya incluye:

- `baseURL` leída desde `VITE_API_URL`
- **Request interceptor**: inyecta `Authorization: Bearer <token>` desde `localStorage`
- **Response interceptor**: normaliza errores Rails al formato `Error(message)`

```ts
import { client } from 'shared/api/client'

// GET
const { data } = await client.get<ApiResponse<Usuario>>('/usuarios/1')

// POST
const { data } = await client.post<ApiResponse<Usuario>>('/usuarios', payload)

// PUT
const { data } = await client.put<ApiResponse<Usuario>>(`/usuarios/${id}`, payload)

// DELETE
await client.delete(`/usuarios/${id}`)
```

Los tipos de respuesta esperados están en `src/shared/api/types.ts`:

```ts
ApiResponse<T>        // { data: T, message?: string }
PaginatedResponse<T>  // { data: T[], meta: { currentPage, totalPages, ... } }
ApiError              // { message, status?, errors? }
```

Para consultas paginadas, usar el hook genérico `usePaginatedQuery`:

```ts
import { usePaginatedQuery } from 'shared/hooks/usePaginatedQuery'

const { data } = usePaginatedQuery<Producto>({
  endpoint: '/productos',
  params: { page: 1, perPage: 10 },
})
```

---

### Formularios con React Hook Form + Zod

```tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { TextField, Button } from '@mui/material'

const schema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  email: z.string().email('Email inválido'),
})

type FormData = z.infer<typeof schema>

export function MiFormulario() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = (data: FormData) => {
    console.log(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <TextField
        {...register('nombre')}
        label="Nombre"
        error={!!errors.nombre}
        helperText={errors.nombre?.message}
      />
      <Button type="submit">Enviar</Button>
    </form>
  )
}
```

---

## Decisiones de arquitectura (ADRs)

| # | Decisión | Estado |
|---|----------|--------|
| [ADR-001](./docs/adr/ADR-001-frontend-stack.md) | Stack frontend: React + TypeScript + Vite | Aceptado |
| [ADR-002](./docs/adr/ADR-002-state-management.md) | State management: Zustand | Aceptado |
| [ADR-003](./docs/adr/ADR-003-data-fetching.md) | Data fetching: React Query + Axios | Aceptado |
| [ADR-004](./docs/adr/ADR-004-ui-library.md) | UI library: MUI + Emotion | Aceptado |
| [ADR-005](./docs/adr/ADR-005-architecture.md) | Arquitectura feature-based | Aceptado |
| [ADR-006](./docs/adr/ADR-006-forms.md) | Formularios: React Hook Form + Zod | Aceptado |

