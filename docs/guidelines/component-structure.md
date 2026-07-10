# Estructura Interna de Componentes

Esta guía define **cómo se organiza un componente por dentro** (archivos, tipos, estilos) y
**dónde viven los estilos** del design system. Complementa a
[`feature-structure.md`](./feature-structure.md), que organiza a nivel de feature.

Aplica a todo componente de `src/shared/components/` y de `src/features/[nombre]/components/`.

---

## 1. Principio: split progresivo

Misma filosofía que la [Regla de Dos](./feature-structure.md#6-migración-a-shared-la-regla-de-dos):
la estructura existe, pero **solo separás en archivos cuando lo amerita**. No fragmentamos un
componente de 20 líneas en 4 archivos.

| Tamaño / complejidad                                             | Estructura                                              |
| --------------------------------------------------------------- | ------------------------------------------------------ |
| Trivial (< ~80 líneas, sin estilos ni tipos sustanciales)       | Un solo archivo `Componente.tsx` (plano)               |
| Sustancial (> ~80 líneas, o estilos/tipos que pesan)            | **Carpeta por componente** con archivos separados      |

Ejemplos actuales:

- Plano: [`LoadingSpinner.tsx`](../../src/shared/components/LoadingSpinner.tsx),
  [`ErrorFallback.tsx`](../../src/shared/components/ErrorFallback.tsx).
- Carpeta: [`StatusBadge/`](../../src/shared/components/StatusBadge),
  [`StatusSelect/`](../../src/shared/components/StatusSelect).

---

## 2. Carpeta por componente

```
StatusBadge/
├── StatusBadge.tsx        # componente: JSX + lógica. SIN estilos (salvo one-liners triviales)
├── StatusBadge.types.ts   # props + tipos públicos
├── StatusBadge.styles.ts  # styled() + constantes de estilo (tamaños, mapas)
└── index.ts               # barrel (API pública del componente)
```

| Archivo            | Responsabilidad                                                                        |
| ------------------ | -------------------------------------------------------------------------------------- |
| `Componente.tsx`   | Estructura JSX + lógica (hooks, handlers). Debe leerse de un vistazo.                   |
| `Componente.types.ts` | `interface Props` + tipos exportados (`StatusVariant`, `StatusOption`, …).           |
| `Componente.styles.ts` | Componentes `styled()`, factories de `sx` y **constantes de estilo** (`BADGE_SIZES`). |
| `index.ts`         | `export { Componente }` + `export type { … }`. Nada más.                                |

El barrel de la capa (`shared/components/index.ts`) re-exporta desde la carpeta, así el consumo
externo no cambia: `import { StatusBadge } from 'shared/components'`.

---

## 3. Dónde viven los estilos

Hay dos frentes bien distintos. **No mezclar.**

### 3.1 Componentes de MUI (Button, Card, TextField…) → en el tema

Sus estilos van a los `styleOverrides`/`variants` del tema, **no** en cada componente. Viven en
[`src/app/theme/components/`](../../src/app/theme/components), **un archivo por componente MUI**:

```
app/theme/
├── tokens.ts              # source of truth de valores crudos (color, spacing, motion…)
├── theme.ts               # arma el tema: palette + typography + assembly
├── augmentations.d.ts     # module augmentation de MUI (variantes, keys de paleta)
├── utils.ts               # helpers (rem)
└── components/
    ├── button.ts          # muiButton(mode)
    ├── card.ts            # muiCard(mode)
    ├── input.ts           # muiOutlinedInput() / muiTextField()
    ├── cssBaseline.ts     # focus ring + prefers-reduced-motion
    ├── typography.ts      # variantMapping
    └── index.ts           # buildComponents(mode) compone todo
```

Al sumar un componente MUI nuevo: se crea su archivo `components/<nombre>.ts` con una factory
`(mode) => override` y se lo agrega a `buildComponents`.

### 3.2 Componentes propios (StatusBadge, StatusSelect, DataTable…) → `styled()`

El estilo se extrae a `Componente.styles.ts` con **`styled()`**. El `.tsx` no lleva estilos.
Se permite `sx` **puntual** solo para one-liners triviales (ej. `sx={{ flexGrow: 1 }}`).

**Patrón de props dinámicas** — pasar variantes (estado, tamaño) como props y bloquear las que no
deben llegar al DOM con `shouldForwardProp`:

```ts
// StatusBadge.styles.ts
const TRANSIENT_PROPS = new Set<string>(['statusColor', 'badgeSize', 'interactive'])

export const BadgeRoot = styled(Box, {
  shouldForwardProp: (prop) => !TRANSIENT_PROPS.has(prop as string),
})<BadgeRootProps>(({ theme, statusColor, badgeSize, interactive }) => ({
  /* estilos derivados del theme y de las props */
}))
```

```tsx
// StatusBadge.tsx — sin un solo estilo adentro
export function StatusBadge({ status, label, size = 'md', ...rest }: StatusBadgeProps) {
  return (
    <BadgeRoot statusColor={status} badgeSize={size} {...rest}>
      {label}
    </BadgeRoot>
  )
}
```

> Para renderizar otro elemento (ej. `<button>` en vez de `<span>`) en un `styled(Box)`, usar el
> prop **`as`**, no `component` (styled no expone `component`).

---

## 4. Reglas de estilo (transversales)

- **Ningún valor crudo fuera de `tokens.ts`.** Colores, radios, duraciones y breakpoints se leen del
  theme (`theme.palette`, `theme.spacing`, `theme.transitions`), nunca hardcodeados en el componente.
- **Un componente por archivo** (`react/no-multi-comp`; los stateless pueden ser excepción).
- **Textos de UI centralizados**, no literales sueltos en el JSX (ver el patrón de `content.ts` en
  la feature `design-system`).
- **Accesibilidad**: focus ring visible (ya global vía `cssBaseline`), `aria-*` en disparadores,
  respetar `prefers-reduced-motion`.

---

## 5. Checklist al crear/mover un componente

1. ¿Es trivial? → archivo plano. ¿Sustancial? → carpeta con `.tsx` / `.types.ts` / `.styles.ts` / `index.ts`.
2. Estilos: si es MUI base → tema (`app/theme/components/`); si es propio → `styled()` en `.styles.ts`.
3. Sin valores crudos ni textos hardcodeados.
4. Exportar por el barrel de la carpeta y, si otras capas lo usan, por el barrel de `shared/components`.
5. `npm run lint` y `npm run build` en verde.
