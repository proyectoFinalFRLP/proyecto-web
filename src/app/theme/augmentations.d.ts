// Module augmentation de MUI — extiende el tema con las variantes tipográficas y
// las keys de paleta del design system (ver ADR-007). Sin esto, TypeScript no
// conoce `variant="dataMono"`, `color="neutral"` ni `palette.success.container`.
import type { CSSProperties } from 'react'

declare module '@mui/material/styles' {
  interface TypographyVariants {
    displayLg: CSSProperties
    displaySm: CSSProperties
    bodyLg: CSSProperties
    bodyMd: CSSProperties
    labelMd: CSSProperties
    labelSm: CSSProperties
    labelCaps: CSSProperties
    dataMono: CSSProperties
  }

  interface TypographyVariantsOptions {
    displayLg?: CSSProperties
    displaySm?: CSSProperties
    bodyLg?: CSSProperties
    bodyMd?: CSSProperties
    labelMd?: CSSProperties
    labelSm?: CSSProperties
    labelCaps?: CSSProperties
    dataMono?: CSSProperties
  }

  // Tonos extra por color, tomados de la escala semántica del DS.
  interface PaletteColor {
    container: string
    strong: string
    onContainer: string
  }

  interface SimplePaletteColorOptions {
    container?: string
    strong?: string
    onContainer?: string
  }

  // Superficie más elevada del DS (hover de ítems, capas superiores) y la escala
  // de profundidad nombrada del luminous layering (floor/deck/modal).
  interface TypeBackground {
    containerHighest: string
    layer: { floor: string; deck: string; modal: string }
  }

  // El tema usa variables CSS con los dos esquemas de color (TESIS-104): con
  // esto `theme.vars` deja de ser opcional en los tipos, que es lo que ya pasa
  // en tiempo de ejecución.
  interface CssThemeVariables {
    enabled: true
  }

  // Tratamiento de elevación (borde + sombra + halo). Índice 0-3:
  // base/card/dropdown/modal. El relleno de cada plano vive en `background.layer`.
  // Cambia por esquema, así que vive en cada `colorSchemes[modo]` y se lee de
  // `theme.vars.elevation`, que devuelve las variables CSS.
  interface ColorSystemOptions {
    elevation?: { boxShadow: string; border: string }[]
  }

  interface ColorSystem {
    elevation: { boxShadow: string; border: string }[]
  }

  interface ThemeVars {
    elevation: { boxShadow: string; border: string }[]
  }

  // `neutral` no existe en la paleta por defecto de MUI. `input` son los
  // rellenos de los campos, que cambian por esquema (ver `buildPalette`).
  interface Palette {
    neutral: PaletteColor
    input: { fill: string; fillDisabled: string; textDisabled: string }
  }

  interface PaletteOptions {
    neutral?: PaletteColorOptions
    input?: { fill: string; fillDisabled: string; textDisabled: string }
  }
}

// Habilita las variantes custom en <Typography variant="…" />.
declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    displayLg: true
    displaySm: true
    bodyLg: true
    bodyMd: true
    labelMd: true
    labelSm: true
    labelCaps: true
    dataMono: true
  }
}

// Habilita color="neutral" en botones (intención Neutral de la matriz).
declare module '@mui/material/Button' {
  interface ButtonPropsColorOverrides {
    neutral: true
  }

  // Acción secundaria sobre superficies profundas: relleno translúcido del tono
  // + borde de un pelo (ver `muiButton`).
  interface ButtonPropsVariantOverrides {
    glass: true
  }
}
