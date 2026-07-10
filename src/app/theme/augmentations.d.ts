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
    dataMono: CSSProperties
  }

  interface TypographyVariantsOptions {
    displayLg?: CSSProperties
    displaySm?: CSSProperties
    bodyLg?: CSSProperties
    bodyMd?: CSSProperties
    labelMd?: CSSProperties
    labelSm?: CSSProperties
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

  // Superficie más elevada del DS (hover de ítems, capas superiores).
  interface TypeBackground {
    containerHighest: string
  }

  // `neutral` no existe en la paleta por defecto de MUI.
  interface Palette {
    neutral: PaletteColor
  }

  interface PaletteOptions {
    neutral?: PaletteColorOptions
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
    dataMono: true
  }
}

// Habilita color="neutral" en botones (intención Neutral de la matriz).
declare module '@mui/material/Button' {
  interface ButtonPropsColorOverrides {
    neutral: true
  }
}
