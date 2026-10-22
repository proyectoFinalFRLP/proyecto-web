# Testing

Pruebas unitarias y de componentes con [Vitest](https://vitest.dev) y
[Testing Library](https://testing-library.com/docs/react-testing-library/intro).

Los tests de punta a punta son otra capa y otra herramienta (Playwright, TESIS-94): viven en
`e2e/` y se describen en la [§7](#7-tests-de-punta-a-punta-playwright).

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

---

## 7. Tests de punta a punta (Playwright)

Los tests unitarios montan un componente con la API simulada. Los de punta a punta abren la app
en un navegador de verdad, contra **la API de Rails de verdad**, y recorren lo que hace una persona:
iniciar sesión, buscar un producto, armar una orden. Lo que prueban es que las piezas encajan —el
contrato con la API, el ruteo, el estado entre pantallas—, no las reglas de cada una.

### Qué cubren

| Archivo             | Flujos                                                                                                   |
| ------------------- | -------------------------------------------------------------------------------------------------------- |
| `auth.spec.ts`      | Redirección al login sin sesión, contraseña incorrecta, login y logout, aislamiento entre tenants        |
| `inventory.spec.ts` | Búsqueda, filtro por estado de stock, paginación y alta de producto con stock inicial (hasta el detalle) |
| `orders.spec.ts`    | Filtro y paginación del listado; alta manual en 3 pasos con retiro en el local y con courier (OCA)       |
| `shipments.spec.ts` | Filtro por estado, paginación y búsqueda por número de orden hasta el detalle                            |
| `theme.spec.ts`     | Cambio dark ↔ light que persiste al recargar, y comparación visual del login en los dos temas            |
| `auth.setup.ts`     | Inicia sesión una vez y guarda la sesión que reusan los demás (no es un test de producto)                |

### Cómo correrlos en local

1. **La API con los seeds**, en `proyecto-api` (ver su `docs/guides/setup-local.md`):

   ```bash
   bin/rails db:prepare db:seed   # una vez: las cuentas y datos de demo
   bin/rails server               # http://localhost:3000
   ```

2. **Los tests**, acá:

   ```bash
   npm run test:e2e       # toda la suite, sin ventana
   npm run test:e2e:ui    # el modo interactivo de Playwright, para escribir o depurar un test
   ```

   Si ya hay un `npm run dev` abierto en `http://localhost:5173`, Playwright lo usa; si no, lo
   levanta él. Los navegadores no se descargan: en local se usa el Chrome instalado
   (`channel: 'chrome'`).

Variables que se pueden cambiar:

| Variable       | Default                        | Para qué                                                      |
| -------------- | ------------------------------ | ------------------------------------------------------------- |
| `E2E_BASE_URL` | `http://localhost:5173`        | Dónde se sirve el front (otro puerto si el 5173 está ocupado) |
| `E2E_API_URL`  | `http://localhost:3000/api/v1` | La API con la que habla el Vite que levanta Playwright        |

Con un `npm run dev` propio, el front usa la API y el tenant de **su** `.env` (`VITE_API_URL`,
`VITE_TENANT=norte`). Los tests asumen la empresa Norte.

Al fallar un test quedan la captura y la traza en `test-results/`; la traza se abre con
`npx playwright show-trace <archivo>.zip`.

### Lo que hay que saber

- **Escriben en la base de desarrollo.** Crean productos (`E2E-…`) y órdenes de clientes `E2E …`
  en cada corrida, y la primera vez completan el catálogo de Norte con productos `E2E-PAG-…`
  sin stock para que tenga una segunda página. `bin/rails db:seed:replant` deja la base como
  salió de los seeds.
- **Corren en serie** (`workers: 1`): comparten la base y cada test ve lo que dejó el anterior.
- **El test de courier depende de OCA.** En los seeds Norte cotiza con el entorno de QA público de
  OCA, por red. Si OCA no devuelve cotizaciones el test queda **salteado** (no falla); si cotiza pero
  no emite el despacho, pasa con una advertencia. El alta completa determinística es la de retiro
  en el local, que no consulta a ningún operador.
- **El login frena después de 10 intentos fallidos en 3 minutos** (TESIS-82). La suite hace dos
  por corrida; correrla muchas veces seguidas puede dejar el login bloqueado unos minutos.
- **Las capturas de referencia** del tema viven en `e2e/theme.spec.ts-snapshots/`, una por sistema
  operativo (las fuentes se dibujan distinto en cada uno): `-win32` para Windows y `-linux` para el
  CI. Si un cambio de diseño las mueve a propósito, `npm run test:e2e -- --update-snapshots`
  regenera las del sistema propio. Las de Linux se bajan del artefacto `playwright-report` del
  workflow `E2E` (allí quedan las capturas `-actual` del test que falló).

### Cómo se escribe uno

Igual que en Testing Library, se busca **por rol y nombre accesible**, con el copy en castellano
de la pantalla: `page.getByRole('button', { name: 'Crear orden' })`. Nada de clases de MUI ni de
`data-testid`: si un control no se puede encontrar por su rol, tampoco lo encuentra un lector de
pantalla. Los datos que se dan por sentados (cuentas, SKU, depósitos) están en
`e2e/support/seeds.ts`, y lo que un test crea lleva un sufijo único (`uniqueSuffix()`) para no
chocar con la corrida anterior.

### En el CI

El workflow `E2E` (`.github/workflows/e2e.yml`) levanta Postgres, clona `proyecto-api`, corre
`db:prepare db:seed`, arranca la API y después la suite con el Chromium de Playwright. Va aparte del
`CI` y no lo bloquea: depende de otro repositorio y de OCA. Corre en cada PR, en `master` y a mano
(`workflow_dispatch`, con la rama de la API a elegir). El reporte queda como artefacto.
