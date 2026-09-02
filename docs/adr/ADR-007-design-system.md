# ADR-007: Design System

**Fecha:** 2026-07-10  
**Estado:** Aceptado

---

## Contexto

El proyecto adopta un design system definido externamente: **Precision OMS v1.2** (exportado
desde un proyecto de Claude Design, tema dark canónico + light derivado). Hasta ahora el tema de
MUI usaba la paleta y tipografía por defecto (ver [ADR-004](./ADR-004-ui-library.md)), sin tokens
propios.

Se necesita traducir ese design system a la infraestructura de theming de MUI 7 de forma
incremental, tipada y reutilizable, sin romper la arquitectura (`features → shared → app`) ni las
convenciones de código vigentes. El trabajo se organiza según las cards de la épica de frontend
**TESIS-99 — Componentes de Frontend y Sistema de Diseño**.

## Decisión

La implementación se organiza en dos capas:

1. **Tokens crudos** en `src/app/theme/tokens.ts` — único source of truth de color, tipografía,
   spacing, radios, motion y breakpoints. Ningún hex/valor se hardcodea fuera de este archivo.
2. **Tema MUI** en `src/app/theme/theme.ts` — consume los tokens y los expone vía `palette`,
   `typography`, `shape`, `transitions`, `breakpoints` y `components`. Las extensiones de tipos
   (variantes tipográficas custom, `color="neutral"`, tonos `container/strong/onContainer`) se
   declaran en `src/app/theme/augmentations.d.ts` (module augmentation).

Los componentes reutilizables que encapsulan patrones del DS viven en `src/shared/components/`
(ej. `StatusBadge`) y leen del tema, nunca importan `tokens.ts` directamente (respeta `shared → app`).

### Decisiones concretas

| #   | Tema                 | Decisión                                                                                                                                              |
| --- | -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| D1  | Tema por defecto     | **Dark** (canónico del DS), manteniendo el toggle light/dark.                                                                                         |
| D2  | Estrategia de tokens | Objeto TS + `cssVariables: true` de MUI 7 (genera CSS vars del tema).                                                                                 |
| D3  | Fuentes              | Self-host con `@fontsource-variable` (Plus Jakarta Sans + Space Grotesk), sin CDN externo.                                                            |
| D4  | Íconos               | Se mantiene `@mui/icons-material` (variantes `Outlined`), no el font Material Symbols del export.                                                     |
| D5  | Catálogo / docs      | Ruta interna `/design-system` como living docs, no Storybook.                                                                                         |
| D6  | Orden de trabajo     | Se implementa por cards de la épica TESIS-99: primero fundaciones (tokens/tema/dark), luego átomos y componentes de estado; el resto según prioridad. |

## Alternativas consideradas

### Solo objeto de tema JS (sin CSS variables)

- ✅ Más simple, sin superficie extra
- ❌ Flicker al cambiar de tema y peor debugging; se pierde poder consumir tokens como CSS vars

### Fuentes vía Google Fonts CDN (como el export original)

- ✅ Cero configuración
- ❌ Dependencia de un CDN externo, peor privacidad/performance, no funciona offline en dev

### Material Symbols Outlined (font de íconos del DS)

- ✅ Paridad visual exacta con el export
- ❌ Otra dependencia de font; `@mui/icons-material` (ya instalado) es tree-shakeable y ergonómico en React

### Storybook para el catálogo

- ✅ Estándar de la industria para documentar componentes
- ❌ Dependencias y configuración pesadas; una ruta interna se despliega con la app sin costo extra

## Consecuencias

- ✅ Un único source of truth de tokens, tipado y sin `any`
- ✅ El tema queda fiel al DS en ambos modos y es extensible de forma incremental
- ✅ Los componentes del DS son reutilizables desde `shared/` respetando las reglas de dependencia
- ✅ `color="neutral"`, `variant="dataMono"` y `palette.success.container` quedan tipados
- ⚠️ Los breakpoints del DS (`640/1024/1280`) se mapean a las keys estándar de MUI (`xs/sm/md/lg/xl`)
  con valores nuevos: revisar cualquier `sx` que ya use esos keys
- ⚠️ Con `cssVariables: true`, `theme.palette.*` devuelve el **hex crudo**, no la forma
  `var(--mui-…)`. La referencia a la variable CSS sale de `theme.vars.*`. Verificado sobre el tema:
  `theme.palette.primary.main` → `#38bdf8`, `theme.vars.palette.primary.main` →
  `var(--mui-palette-primary-main, #38bdf8)`. Hoy el código consume `theme.palette.*` en todos
  lados, así que las variables CSS que MUI genera no se usan (ver TESIS-104)

---

## Actualización — dónde vive el diseño (2026-08-30)

El contexto de arriba ya decía que el design system viene de un proyecto de **Claude Design**.
Esta sección fija dónde vive cada pieza y cierra una ambigüedad que costó cara.

### Las tres capas, y cuál manda

| Capa                  | Dónde                                                | Qué es                                                                                                                |
| --------------------- | ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Fuente del diseño     | Lienzo de Claude Design                              | Donde se diseña y se discute. Las 14 pantallas en tema oscuro y claro, construidas sobre diez componentes compartidos |
| Copia versionada      | [`docs/design/`](../design/)                         | Las fuentes `.dc.html` de las pantallas y los componentes, congeladas en el repositorio                               |
| Traducción ejecutable | `src/app/theme/tokens.ts` y `src/shared/components/` | Lo único que el código consume                                                                                        |

Ante una diferencia entre el diseño y el código, **manda el diseño para la forma y manda
`tokens.ts` para los valores**: los tokens ya están verificados contra el tema en ambos modos, y
volver a extraer un color de una captura es cómo se introducen desviaciones.

### Por qué se versiona el `.dc.html` y no el PDF

Mismo criterio con el que se versiona un diagrama en su formato de origen y no sólo su imagen: el
`.dc.html` lleva el marcado, los estilos en línea y qué componente instancia cada pantalla. Un PDF
lleva píxeles. Para implementar una pantalla, lo primero sirve; lo segundo obliga a estimar.

El PDF renderizado de los mockups es un entregable académico y vive con el resto de la entrega, no
en el repositorio.

### El archivo de Figma queda obsoleto

No debe usarse como referencia. El motivo no es de gusto: **de sus 46 frames de nivel superior,
ninguno era un componente**. Cada pantalla se había dibujado entera de nuevo, y el resultado
derivó — el menú lateral tenía siete ítems en una pantalla y cinco en otra, el producto aparecía
con cuatro nombres distintos, y convivían operadores logísticos internacionales con los argentinos
del dominio real.

Las cards de frontend anteriores a esta fecha llevan en su descripción una línea `Figma: <url>`.
**Ese enlace está obsoleto**: la pantalla correspondiente está en `docs/design/`.
