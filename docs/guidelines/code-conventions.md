# Convenciones de código

## 1. TypeScript

- **Strict mode** habilitado (`strict: true`, `noUnusedLocals`, `noUnusedParameters`)
- **Sin `any`**: regla ESLint `@typescript-eslint/no-explicit-any: error`
- **Type imports**: siempre `import type { ... }` para importar solo tipos (`verbatimModuleSyntax` habilitado)
- **Sin non-null assertion** (`!`): prohibido por ESLint
- **Optional chaining**: preferido sobre comprobaciones manuales (`?.`)

**Naming conventions** (enforced por ESLint):

| Selector | Formato |
|---|---|
| Tipos, interfaces, enums, clases | `PascalCase` |
| Variables | `camelCase`, `UPPER_CASE` o `PascalCase` |
| Hooks (`use*`) | `camelCase` |

Variables y parámetros prefijados con `_` quedan excluidos de las reglas de no-unused.

---

## 2. React

- **Un componente por archivo** (`react/no-multi-comp`; stateless pueden ser excepción)
- **No index como key** en listas (`react/no-array-index-key`)
- **No fragmentos innecesarios** (`react/jsx-no-useless-fragment`)
- **Self-closing** cuando el componente no tiene children (`react/self-closing-comp`)
- **No componentes como props inline** (`react/no-unstable-nested-components`)
- **Renders condicionales**: solo con ternario o coerción booleana. Nunca `valor && <Comp />` si `valor` puede ser `0` (`react/jsx-no-leaked-render`)
- **useState naming**: siempre `[value, setValue]` (`react/hook-use-state`)
- **Sin `useEffect` + `useState` para fetch**: siempre `useQuery` / `useMutation`

---

## 3. Imports

**Orden** (enforced por `import/order`):

1. `builtin` — módulos de Node
2. `external` — paquetes npm
3. `internal` — aliases (`shared/`, `features/`, `app/`)
4. `parent` — rutas relativas hacia arriba (`../`)
5. `sibling` — rutas relativas al mismo nivel (`./`)
6. `index`

Línea en blanco entre cada grupo. Cada grupo ordenado alfabéticamente (case insensitive).

```ts
// ✅ Ejemplo correcto
import { useQuery } from '@tanstack/react-query'        // external
import { Box } from '@mui/material'                      // external

import { client } from 'shared/api/client'               // internal
import type { ApiResponse } from 'shared/api/types'      // internal

import type { User } from '../types'                      // parent
```

Sin imports duplicados (`import/no-duplicates`).

---

## 4. Código general

| Regla | Descripción |
|---|---|
| `prefer-const` | Siempre `const`; nunca `let` para variables que no cambian |
| `no-var` | Prohibido |
| `eqeqeq` | Siempre `===` |
| `no-else-return` | Sin `else` ni `else if` después de un `return` |
| `object-shorthand` | `{ x }` en lugar de `{ x: x }` |
| `prefer-template` | Template literals en lugar de concatenación con `+` |
| `no-console` | Solo `console.warn` y `console.error` permitidos |

Comentarios `TODO`, `FIXME`, `HACK` al inicio de línea generan warnings ESLint.

---

## 5. Prettier

```json
{
  "singleQuote": true,
  "semi": false,
  "tabWidth": 2,
  "trailingComma": "all",
  "printWidth": 100,
  "bracketSpacing": true,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

Puntos clave:
- **Sin punto y coma** al final de líneas
- **Comillas simples** en strings
- **Trailing comma** en todos los contextos (arrays, objetos, parámetros de función, etc.)
- **Ancho máximo**: 100 caracteres
- **Fin de línea**: LF (Unix)

---

## 6. Formularios (React Hook Form + Zod)

### Patrón estándar

```tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { TextField, Button } from '@mui/material'

const schema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  email: z.string().email('Email inválido'),
})

type FormData = z.infer<typeof schema>  // siempre inferir el tipo del schema

export function MiFormulario() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  return (
    <form onSubmit={handleSubmit((data) => { /* ... */ })}>
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

### Notas

- El schema Zod es la **única fuente de verdad** para tipos y validación — nunca definir la interfaz por separado
- Para campos MUI con estado complejo usar el patrón `Controller` de RHF
- El mismo schema puede reutilizarse para validar responses de la API
- Zod v4 tiene cambios de API respecto a v3 — consultar la documentación al agregar nuevos schemas
