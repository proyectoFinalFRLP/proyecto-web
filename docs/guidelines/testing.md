# Testing

Pruebas unitarias y de componentes con [Vitest](https://vitest.dev) y
[Testing Library](https://testing-library.com/docs/react-testing-library/intro).

Los tests de punta a punta son otra capa y otra herramienta (TESIS-94): no viven acá.

---

## 1. Comandos

```bash
npm run test         # corre la suite una vez (lo que corre el CI y el pre-push)
npm run test:watch   # modo interactivo mientras se desarrolla
```

El hook `pre-push` corre la suite completa, así que una prueba en rojo no llega al repositorio.
En el CI, el job `Unit Tests` corre después de `Lint & Format` y en paralelo con `Build`.

---

## 2. Dónde vive un test

**Al lado del módulo que prueba**, con el mismo nombre y el sufijo `.test`:

```
src/shared/utils/jwt.ts
src/shared/utils/jwt.test.ts

src/shared/components/StatusBadge/
├── StatusBadge.tsx
├── StatusBadge.styles.ts
├── StatusBadge.types.ts
├── StatusBadge.test.tsx        ← acá
└── index.ts
```

No hay carpeta `__tests__` ni un árbol espejo en `tests/`. La razón es la misma por la que los
estilos y los tipos de un componente viven en su carpeta (ver
[component-structure.md](./component-structure.md)): quien abre el módulo ve lo que hay que
actualizar cuando lo cambia.

Un test nunca se exporta desde el `index.ts` de la carpeta.

---

## 3. Cómo se escribe

Vitest corre **sin `globals`**: `describe`, `it`, `expect` y `vi` se importan, igual que cualquier
otra dependencia del archivo.

```ts
import { describe, expect, it } from 'vitest'

import { formatDimensions } from './dimensions'

describe('formatDimensions', () => {
  it('returns null when the three axes are zero', () => {
    expect(formatDimensions({ length: 0, width: 0, height: 0 })).toBeNull()
  })
})
```

Los nombres de los `it` van **en inglés**, como los commits y los PRs. Los comentarios van en
español, como el resto del código.

El nombre describe **el comportamiento, no la función**: `returns null when the three axes are zero`,
no `test formatDimensions`. Si el nombre no se puede escribir sin decir "correctamente",
probablemente el caso todavía no está pensado.

---

## 4. Componentes

Se montan con `renderWithTheme`, de
[`src/test/renderWithTheme.tsx`](../../src/test/renderWithTheme.tsx):

```tsx
import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { renderWithTheme } from '../../../test/renderWithTheme'

import { StatusBadge } from './StatusBadge'

describe('StatusBadge', () => {
  it('always shows the label', () => {
    renderWithTheme(<StatusBadge status="success" label="Entregado" />)

    expect(screen.getByText('Entregado')).toBeInTheDocument()
  })
})
```

**No se usa `render` pelado.** El tema de la app agrega roles que el tema por defecto de MUI no
tiene (`palette.neutral`, los tonos `container` / `onContainer`), y sin proveedor esos accesos
revientan en vez de degradarse.

`renderWithTheme` acepta `{ mode: 'light' | 'dark' }` para los componentes que deciden por el modo.

### Qué se consulta

En orden de preferencia: `getByRole` → `getByLabelText` → `getByText` → `getByTestId`.

`getByRole` es el primero porque es lo que ve un lector de pantalla: si el badge clickeable no
aparece como `button`, falla el test y también la accesibilidad. `getByTestId` es el último recurso,
para nodos que no tienen rol ni texto propio.

---

## 5. Qué se prueba

Lo que puede romperse en silencio:

- **Funciones puras del dominio** — traducciones entre el formulario y la API, parseo de formatos.
  Son las más baratas de probar y las que más reglas concentran.
- **Lo que decide si hay sesión** — un borde mal resuelto deja gente afuera, o adentro de más.
- **Lo que viene de afuera de la app** — `localStorage`, el payload de un JWT, un campo de texto
  libre de la base. Ahí es donde aparecen las formas que nadie previó.
- **Las reglas que están escritas en un comentario.** Si hizo falta explicar por qué el código hace
  algo raro, ese "raro" merece una prueba: es exactamente lo que el próximo refactor va a borrar.

Lo que no se prueba: que MUI renderice, que Zod valide, que React Query cachee. Son dependencias con
su propia suite.

---

## 6. Fixtures compartidos

En [`src/test/`](../../src/test/):

| Archivo               | Qué da                                                                    |
| --------------------- | ------------------------------------------------------------------------- |
| `setup.ts`            | Matchers de `jest-dom` y el desmontaje entre casos. Lo carga Vitest solo. |
| `renderWithTheme.tsx` | Montaje de componentes con el tema de la app                              |
| `tokens.ts`           | JWTs de prueba (`sessionToken`, `tokenWith`)                              |

Un fixture llega acá cuando lo necesita **más de una feature**. Si es de una sola, vive en su
carpeta.
