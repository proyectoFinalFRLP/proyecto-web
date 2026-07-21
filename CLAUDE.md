# CLAUDE.md

## Antes de empezar cualquier tarea

Leer obligatoriamente estos archivos en este orden antes de escribir una sola línea de código:

1. [`docs/guidelines/architecture.md`](docs/guidelines/architecture.md) — estructura de carpetas, capas, reglas de dependencia, patrones de implementación
2. [`docs/guidelines/code-conventions.md`](docs/guidelines/code-conventions.md) — TypeScript, React, ESLint, Prettier, formularios
3. [`docs/guidelines/feature-structure.md`](docs/guidelines/feature-structure.md) — dominios de negocio, cómo agregar features, reglas de importación, barrel exports
4. [`docs/guidelines/component-structure.md`](docs/guidelines/component-structure.md) — estructura interna de componentes: carpeta por componente, split progresivo, dónde viven los estilos
5. [`docs/guidelines/git-workflow.md`](docs/guidelines/git-workflow.md) — ramas, commits, PRs, hooks, CI/CD
6. El ADR relevante según el dominio de la tarea (ver [`docs/adr/`](docs/adr/))

Si la tarea viene de una card de Jira, leer la card completa en https://proyectofinalfrlp.atlassian.net/browse/TESIS-XXX antes de planificar la implementación.

---

## Proyecto

Frontend del trabajo final de la carrera de Ingeniería en Sistemas de Información (FRLP). SPA construida en React que consume la API REST del backend Rails (OMS multi-tenant).

**Repositorio:** `proyectoFinalFRLP/proyecto-web`  
**Backend:** `proyectoFinalFRLP/proyecto-api` (Ruby on Rails API-only)  
**Gestor de tareas:** Jira (proyecto `TESIS`) — https://proyectofinalfrlp.atlassian.net/jira/software/projects/TESIS/list

---

## Comandos esenciales

```bash
npm install           # Instalar dependencias

npm run dev           # Servidor de desarrollo en localhost:5173

npm run build         # Build de producción (tsc + vite)

npm run lint          # ESLint (--max-warnings 0)

npm run lint -- --fix # Auto-corregir problemas de ESLint
```

### Variable de entorno

Copiar `.env.example` a `.env` y completar:

```bash
VITE_API_URL=http://localhost:3000/api/v1   # URL base de la API Rails (sin trailing slash)
```

---

## Stack tecnológico

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

---

## Arquitectura

Ver documentación completa en [`docs/guidelines/architecture.md`](docs/guidelines/architecture.md).

### Estructura de carpetas

```
src/
├── app/          # Configuración global: layout, providers, router, tema MUI
├── features/     # Módulos de negocio (uno por feature)
│   └── [feature]/
│       ├── components/
│       ├── hooks/        # useQuery / useMutation wrapeados
│       ├── pages/
│       ├── types.ts
│       └── index.ts      # Barrel export
└── shared/       # Código reutilizable entre features
    ├── api/      # Cliente Axios + interceptors
    ├── components/
    ├── hooks/
    ├── store/    # Zustand stores
    ├── types/
    └── utils/
```

### Reglas de dependencia

```
features  →  shared    ✅
features  →  app       ❌ PROHIBIDO
shared    →  features  ❌ PROHIBIDO
app       →  features  ✅ solo en app/router/
```

---

## Patrones clave

### Data fetching — siempre con React Query

```ts
// ✅ Correcto — custom hook con useQuery
export function useOrders() {
  return useQuery<Order[]>({
    queryKey: ['orders'],
    queryFn: async () => {
      const { data } = await client.get<ApiResponse<Order[]>>('/orders')
      return data.data
    },
  })
}

// ❌ Prohibido — nunca useEffect + useState para fetch
```

### Imports — siempre absolutos

```ts
// ✅ Correcto
import { client } from 'shared/api/client'
import { LoadingSpinner } from 'shared/components'

// ❌ Incorrecto
import { client } from '../../../shared/api/client'
```

### Formularios — React Hook Form + Zod

```ts
const schema = z.object({ email: z.string().email() })
type FormData = z.infer<typeof schema> // inferir siempre del schema

const {
  register,
  handleSubmit,
  formState: { errors },
} = useForm<FormData>({
  resolver: zodResolver(schema),
})
```

---

## Trabajar con una card de Jira

1. Leer la card: `https://proyectofinalfrlp.atlassian.net/browse/TESIS-XXX`
2. Crear rama: `TESIS-XXX-descripcion-en-kebab-case`
3. Crear feature en `src/features/[nombre]/` con la estructura estándar
4. Implementar siguiendo los patrones documentados
5. `npm run lint` sin errores
6. `npm run build` sin errores
7. PR con título: `tipo: [TESIS-XXX] descripción en inglés`

---

## Convenciones de código (resumen)

Ver detalle en [`docs/guidelines/code-conventions.md`](docs/guidelines/code-conventions.md).

- **Sin `any`** — prohibido por ESLint
- **`import type`** para importar solo tipos
- **Sin `useEffect` + `useState` para fetch** — siempre `useQuery` / `useMutation`
- **Sin punto y coma**, **comillas simples**, trailing comma — enforced por Prettier
- **Commits en inglés**, formato Conventional Commits: `feat: add order list page`

---

## CI/CD

Pipeline en `.github/workflows/ci.yml`:

| Job           | Acción                              |
| ------------- | ----------------------------------- |
| `lint`        | ESLint + Prettier check             |
| `branch-name` | Valida nombre de rama (solo en PRs) |
| `build`       | `npm run build` (tsc + vite)        |

---

## Documentación completa

| Documento                                                                        | Contenido                                                                         |
| -------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| [docs/guidelines/architecture.md](docs/guidelines/architecture.md)               | Estructura, capas, reglas de dependencia, imports, patrones                       |
| [docs/guidelines/code-conventions.md](docs/guidelines/code-conventions.md)       | TypeScript, React, imports, Prettier, formularios                                 |
| [docs/guidelines/feature-structure.md](docs/guidelines/feature-structure.md)     | Features, barrel exports, regla de dos, rutas                                     |
| [docs/guidelines/component-structure.md](docs/guidelines/component-structure.md) | Estructura interna de componentes, split progresivo, estilos (`styled()` vs tema) |
| [docs/guidelines/git-workflow.md](docs/guidelines/git-workflow.md)               | Ramas, commits, PRs, Husky, CI/CD                                                 |
| [docs/guidelines/pr-guidelines.md](docs/guidelines/pr-guidelines.md)             | Cómo redactar PRs con ejemplos                                                    |
| [docs/adr/](docs/adr/)                                                           | 7 decisiones arquitectónicas (ADRs)                                               |
