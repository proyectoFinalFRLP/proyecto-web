# Accesibilidad y consistencia del Design System

Qué se revisa para que las pantallas principales cumplan lo básico de **WCAG 2.1 AA** en los dos
temas, cómo se corre el chequeo y qué salió de la primera pasada (TESIS-91, octubre de 2026).

---

## 1. El chequeo automático

`e2e/a11y.spec.ts` recorre cada pantalla en **claro y oscuro** y corre
[axe-core](https://github.com/dequelabs/axe-core) (`@axe-core/playwright`) con las reglas de WCAG
2.0/2.1 nivel A y AA (`wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`).

- **Falla** con cualquier hallazgo de impacto `critical` o `serious`.
- Los `moderate` y `minor` no bloquean, pero quedan en el adjunto `axe-results` de cada test (el
  reporte HTML de Playwright los muestra).
- Va con el resto de la suite de punta a punta: `npm run test:e2e` (ver
  [testing.md §7](./testing.md#7-tests-de-punta-a-punta-playwright)). Para correr sólo este:

  ```bash
  npx playwright test e2e/a11y.spec.ts
  ```

- Con `A11Y_SCREENSHOTS_DIR=<carpeta>` guarda además una captura de página completa de cada pantalla
  en cada tema, para el recorrido visual (§3).

| Pantalla               | Cómo llega el test                                                    |
| ---------------------- | --------------------------------------------------------------------- |
| Login                  | Sin sesión, `/login`                                                  |
| Panel                  | `/`                                                                   |
| Órdenes — listado      | `/orders`                                                             |
| Órdenes — alta, paso 1 | `/orders/new`                                                         |
| Órdenes — alta, paso 2 | Paso 1 completo, con envío a domicilio (muestra el form de domicilio) |
| Órdenes — alta, paso 3 | Paso 2 con retiro en el local (no depende de que OCA cotice)          |
| Órdenes — detalle      | La primera orden del listado                                          |
| Envíos                 | `/shipments`                                                          |
| Inventario             | `/inventory`                                                          |
| Depósitos              | `/warehouses`                                                         |
| Reportes               | `/reports`                                                            |

El tema se fija antes de que cargue la app, escribiendo la preferencia en `localStorage` igual que lo
hace el toggle.

### Qué no ve axe

axe mide lo que se puede medir en el DOM: contraste, nombres accesibles, labels, roles, landmarks.
No sabe si el foco **se ve**, si el orden de tabulación tiene sentido o si una pantalla se ve rota.
Eso se revisó a mano (§3) y se repite cuando una pantalla cambia mucho.

---

## 2. Resultado de la primera pasada

### Antes

Con la spec recién escrita, 7 de las 22 corridas fallaban, todas por **contraste** (`color-contrast`,
impacto `serious`), 66 nodos en total:

| Pantalla          | Claro                                                                               | Oscuro                                    |
| ----------------- | ----------------------------------------------------------------------------------- | ----------------------------------------- |
| Panel             | 2 («Sin destino»)                                                                   | —                                         |
| Órdenes — listado | 16 («Sin destino», «Retiro en el local», «Sin asignar»)                             | —                                         |
| Envíos            | 2 («Sin asignar»)                                                                   | —                                         |
| Inventario        | 30 («Sin categoría», «Sin asignar», también sobre filas críticas; «+2 en tránsito») | 12 (badge «Sin stock» sobre fila crítica) |
| Reportes          | —                                                                                   | 2 (badge «Crítico» sobre fila crítica)    |
| El resto          | —                                                                                   | —                                         |

Además, una pasada exploratoria con las reglas `best-practice` de axe (no forman parte de WCAG y no
bloquean) marcó que la navegación lateral y la barra del login estaban fuera de todo landmark.

### Qué se corrigió

| Hallazgo                                                                                                                                              | Corrección                                                                                                                                                                                                                |
| ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Los valores ausentes («Sin destino», «Sin categoría», «—»…) iban en `text.disabled`: 2.7:1 sobre blanco, 2.6:1 sobre la fila crítica                  | Pasan a `text.secondary` (9.3:1). `text.disabled` queda para controles deshabilitados, que WCAG exime. Se cambió en todas las celdas y campos que lo usaban como «dato que no existe», no sólo en las pantallas auditadas |
| El texto del `StatusBadge` en oscuro iba en `main` (#fb7185): 4.4:1 sobre la fila crítica de `DataTable`                                              | Va en `onContainer` en los dos modos, que es lo que pinta `docs/design/StatusBadge.dc.html` (`--err-fg` = `textD`). 8.4:1 en el peor caso                                                                                 |
| «+2 en tránsito» del inventario en `info.main`: 2.8:1 sobre blanco a 11px                                                                             | `info.onContainer`. Y en bloque: el número y la nota se leían pegados («11+2 en tránsito»)                                                                                                                                |
| Placeholder de los inputs: el de MUI es el color del texto al 42% / 50%, 2.6:1 en claro y 4.3:1 en oscuro sobre el relleno del input (axe no lo mide) | Token `inputColors.*.placeholder` (4.9:1 / 5.4:1) aplicado en el tema (`MuiOutlinedInput`)                                                                                                                                |
| El panel no tenía `h1`: su título era un `h2` (`displaySm`)                                                                                           | `component="h1"` con la misma variante visual. Los títulos de las tarjetas pasan a `h2`                                                                                                                                   |
| El número de cada `StatCard` / `CompactStatCard` era un encabezado (`h2`): la navegación por títulos listaba «19», «22»…                              | `component="p"`                                                                                                                                                                                                           |
| El login no tenía `h1`                                                                                                                                | El nombre de la empresa es el `h1`                                                                                                                                                                                        |
| La navegación lateral no era un landmark                                                                                                              | `<nav aria-label="Navegación principal">` alrededor de la lista                                                                                                                                                           |
| La barra superior del login quedaba fuera de todo landmark                                                                                            | `header`                                                                                                                                                                                                                  |

### Después

**0 hallazgos** de WCAG A/AA en las 22 corridas, de ningún impacto. Con `best-practice` también en 0.

### Foco y teclado

Se recorrieron con Tab los primeros 30 controles de cada pantalla con sesión (panel, órdenes, alta,
envíos, inventario, depósitos, reportes): todos muestran el foco (el estado `focus-visible` del tema
en botones y enlaces; en los inputs, el borde y el halo de acento del contenedor). Los botones de
solo ícono (tema, notificaciones, menú de cada fila, copiar seguimiento, paginación) tienen nombre
accesible: axe lo verifica con `button-name` en cada corrida.

---

## 3. Recorrido visual en claro y oscuro

Con las capturas de `A11Y_SCREENSHOTS_DIR` se miraron las 11 pantallas en los dos temas.

Corregido:

- **La tarjeta «Alertas de inventario» del panel** pintaba el número con el azul (y el violeta de
  visitado) del enlace del navegador, porque la tarjeta entera es un enlace y el número heredaba su
  color. Ahora hereda el color de texto.
- **«+2 en tránsito»** del inventario, pegado al número (ver arriba).

Documentado, sin corregir en este PR:

- **Tablas anchas a 1280 px con la navegación lateral abierta.** El listado de órdenes y el de envíos
  miden más que el hueco (~990 px) y scrollean en horizontal; la columna de acciones, fija a la
  derecha, tapa la última columna (el total de la orden, el estado del envío) hasta que se scrollea.
  Es el comportamiento previsto de `DataTable` (el scroll vive en la tabla), y cerrando la
  navegación lateral entra todo. Achicarlo pide decidir qué columna se va o se angosta en ese
  ancho, que es una decisión de diseño de cada listado.
- **SKU largos en el inventario** (los `E2E-…` que crean los tests) se parten en el guion y la
  columna del nombre queda angosta. Con los SKU de los seeds (`NOR-005`) no pasa.
- **Texto de error en `error.main` en claro** (#f43f5e, 3.7:1 sobre blanco): lo usan el texto de
  ayuda de los campos con error y los avisos de error en línea. No aparece en los estados que recorre
  la spec (sin errores de validación) y es el `main` del semántico que MUI usa en todos sus
  componentes; subirlo a un tono AA es un cambio de paleta para decidir con el diseño
  (`error.onContainer` o `error.strong` sobre blanco cumplen).

---

## 4. Exclusiones

Ninguna. `EXCLUDED_SELECTORS` en `e2e/a11y.spec.ts` está vacío.

Si alguna vez hace falta excluir un nodo (un widget de terceros que axe no puede evaluar, por
ejemplo), se agrega ahí **y** se documenta en esta sección con el motivo. Una exclusión sin
documentar no pasa el review.

---

## 5. Consistencia con el Design System

Lo que se revisó con búsquedas sobre `src/` (fuera de `tokens.ts` y de la página `/design-system`,
que muestra los valores crudos a propósito):

| Qué                                                 | Resultado                                                                                                                                                                                                                             |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Colores sueltos (hex, `rgb()`, `rgba()`)            | El menú de `StatusSelect` tenía su sombra hardcodeada por modo: usa `theme.vars.elevation[2]`. El brillo del `Skeleton` pasó a un token (`skeletonShimmer`). Quedan los de `theme.ts`/`branding.ts`, que son la capa que arma el tema |
| Espaciado suelto                                    | `gap: 12` en `StatCard` y `ProgressIndicator`, y el padding/gap en px del menú de `StatusSelect`, pasan a `theme.spacing`. Los anchos de columna y de grilla en px son layout, no espaciado del DS                                    |
| Radios                                              | Las features repiten `12` / `9999` con un comentario que apunta al token: no pueden importar de `app/` (architecture.md §3.2) y el tema sólo expone el radio base. Se deja así                                                        |
| Estados como chip que no usan `StatusBadge`         | Ninguno. El único `Chip` (envíos) es el filtro «Demorados» removible, no un estado                                                                                                                                                    |
| IDs, SKU, seguimiento y orden de retiro sin la mono | Todos usan `dataMono` (Space Grotesk): número de orden en listados, panel, reportes y detalle; SKU en inventario, alta y detalle; seguimiento en envíos, panel y detalle; orden de retiro en el detalle                               |
