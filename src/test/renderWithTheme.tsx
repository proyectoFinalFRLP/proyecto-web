import { ThemeProvider } from '@mui/material'
import { render } from '@testing-library/react'
import type { RenderOptions, RenderResult } from '@testing-library/react'
import { createAppTheme } from 'app/theme/theme'
import type { ReactElement } from 'react'

type ThemeMode = 'light' | 'dark'

/**
 * Monta un componente con el tema de la app.
 *
 * No es opcional para nada que use `styled()`: el tema de la app agrega roles
 * que el tema por defecto de MUI no tiene (`palette.neutral`, los tonos
 * `container` / `onContainer`), y sin proveedor esos accesos revientan en vez
 * de degradarse.
 *
 * El modo es un parámetro porque hay componentes que deciden por él —
 * `StatusBadge` pinta el texto distinto en claro y en oscuro— y esa bifurcación
 * merece una prueba de cada lado.
 */
export function renderWithTheme(
  ui: ReactElement,
  { mode = 'dark', ...options }: RenderOptions & { mode?: ThemeMode } = {},
): RenderResult {
  const theme = createAppTheme()

  // El tema trae los dos esquemas: el modo pedido entra como esquema activo,
  // igual que lo hace `ThemeWrapper` en la app. Sin persistencia, para que un
  // test no le deje el modo al siguiente.
  return render(ui, {
    wrapper: ({ children }) => (
      <ThemeProvider theme={theme} defaultMode={mode} storageManager={null}>
        {children}
      </ThemeProvider>
    ),
    ...options,
  })
}
