# ADR-005: Arquitectura y Estructura de Carpetas

**Fecha:** 2026-04-03  
**Estado:** Aceptado

---

## Contexto

El proyecto necesita una estructura de carpetas que sea:

- Escalable a medida que se agreguen features
- Fácil de navegar para cualquier integrante del equipo
- Clara en cuanto a dónde vive cada pieza de código
- Compatible con el crecimiento del equipo sin generar conflictos

## Decisión

Se adopta una **arquitectura feature-based** con las siguientes capas:

```
src/
├── app/                    # Configuración global de la aplicación
│   ├── layout/             # Layout principal (Header, Sidebar, AppLayout)
│   ├── providers/          # Wrapper de providers (QueryClient, Theme, Router)
│   ├── router/             # Definición de rutas
│   └── theme/              # Configuración del tema MUI
│
├── features/               # Módulos de negocio (uno por feature)
│   └── [feature]/
│       ├── components/     # Componentes propios del feature
│       ├── hooks/          # Custom hooks del feature
│       ├── pages/          # Páginas (rutas) del feature
│       ├── types.ts        # Tipos TypeScript del feature
│       └── index.ts        # Barrel export
│
├── shared/                 # Código reutilizable entre features
│   ├── api/                # Cliente Axios y tipos de respuesta
│   ├── components/         # Componentes reutilizables (LoadingSpinner, etc.)
│   ├── hooks/              # Hooks reutilizables
│   ├── store/              # Stores Zustand globales
│   ├── types/              # Tipos TypeScript compartidos
│   └── utils/              # Funciones utilitarias
│
└── tests/                  # Tests globales o de integración
```

### Reglas de dependencia

```
features → shared         ✅ permitido
features → app            ❌ prohibido
shared   → features       ❌ prohibido
shared   → app            ❌ prohibido
app      → features       ✅ permitido (solo en router)
app      → shared         ✅ permitido
```

### Sistema de imports

`tsconfig.app.json` tiene `"baseUrl": "./src"`, lo que habilita imports absolutos sin prefijo:

```ts
// En lugar de:
import { client } from '../../../shared/api/client'

// Se usa:
import { client } from 'shared/api/client'
```

## Alternativas consideradas

### Estructura por tipo de archivo (components/, hooks/, pages/, ...)

- ❌ No escala: a medida que crecen los features, las carpetas se vuelven enormes y difíciles de navegar
- ❌ Los archivos relacionados están dispersos en diferentes carpetas

### Monorepo con workspaces

- ✅ Máximo aislamiento entre módulos
- ❌ Overhead de configuración excesivo para el alcance del proyecto
- ❌ Requiere herramientas adicionales (Turborepo, Nx)

## Consecuencias

- ✅ Cada feature es autocontenido: sus componentes, hooks y tipos viven juntos
- ✅ El código compartido está claramente separado del específico de cada feature
- ✅ Fácil onboarding: la estructura es predecible y documentada
- ✅ Los barrel exports (`index.ts`) simplifican los imports entre módulos
- ⚠️ Requiere disciplina para respetar las reglas de dependencia entre capas
- ⚠️ Features grandes pueden necesitar subdivisión interna propia
