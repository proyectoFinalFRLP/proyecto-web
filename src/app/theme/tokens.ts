// Design tokens — Precision OMS Design System v1.2
//
// Único source of truth de los valores crudos del design system. Nadie hardcodea
// un color, radio, duración o breakpoint fuera de este archivo: todo lo consume
// `theme.ts` y, a través del tema, el resto de la app.
//
// Fuente canónica: proyecto Claude Design "Google Stitch export y Design System",
// archivo `Design System v1.2.dc.html`.

// ──────────────────────────────────────────────────────────────────────────────
// Fuentes
// ──────────────────────────────────────────────────────────────────────────────

export const fontFamily = {
  sans: "'Plus Jakarta Sans Variable', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  mono: "'Space Grotesk Variable', 'SF Mono', Menlo, Consolas, monospace",
} as const

// ──────────────────────────────────────────────────────────────────────────────
// Escala tipográfica — tamaño en px / peso. Los line-height son derivados (no
// especificados en el DS) buscando legibilidad en UI densa.
// ──────────────────────────────────────────────────────────────────────────────

export const typographyScale = {
  displayLg: { fontSize: 48, fontWeight: 700, lineHeight: 1.1, family: 'sans' },
  displaySm: { fontSize: 32, fontWeight: 700, lineHeight: 1.15, family: 'sans' },
  h1: { fontSize: 24, fontWeight: 600, lineHeight: 1.25, family: 'sans' },
  h2: { fontSize: 20, fontWeight: 600, lineHeight: 1.3, family: 'sans' },
  h3: { fontSize: 18, fontWeight: 600, lineHeight: 1.35, family: 'sans' },
  bodyLg: { fontSize: 16, fontWeight: 400, lineHeight: 1.6, family: 'sans' },
  bodyMd: { fontSize: 14, fontWeight: 400, lineHeight: 1.5, family: 'sans' },
  labelMd: { fontSize: 12, fontWeight: 600, lineHeight: 1.4, family: 'sans' },
  labelSm: { fontSize: 11, fontWeight: 500, lineHeight: 1.4, family: 'sans' },
  dataMono: { fontSize: 14, fontWeight: 500, lineHeight: 1.4, family: 'mono' },
} as const

export type TypographyToken = keyof typeof typographyScale

// ──────────────────────────────────────────────────────────────────────────────
// Espaciado (base 4px), radios y layout
// ──────────────────────────────────────────────────────────────────────────────

export const spacingBase = 4

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 } as const

export const radius = { sm: 4, base: 8, md: 12, lg: 16, full: 9999 } as const

export const layout = {
  gridGutter: 20,
  pageMargin: 32,
  maxContent: 1440,
  sidebarWidth: 240,
  sidebarRail: 72,
} as const

// ──────────────────────────────────────────────────────────────────────────────
// Elevación — "luminous layering" (estilo v1.2). 4 niveles:
//   0 base · 1 cards/paneles · 2 menús/dropdowns · 3 modales/foco.
// Dark: borde blanco creciente + sombra sutil. Light: sombra ambiental difusa.
// ──────────────────────────────────────────────────────────────────────────────

export const elevationShadow = {
  dark: [
    'none',
    '0 1px 2px rgba(0, 0, 0, 0.3)',
    '0 12px 32px rgba(0, 0, 0, 0.5)',
    '0 24px 48px rgba(0, 0, 0, 0.6)',
  ],
  light: [
    'none',
    '0 1px 3px rgba(16, 24, 40, 0.06), 0 1px 2px rgba(16, 24, 40, 0.04)',
    '0 12px 32px rgba(16, 24, 40, 0.12)',
    '0 24px 48px rgba(16, 24, 40, 0.16)',
  ],
} as const

// Opacidad del borde blanco por nivel (solo dark; 0 = sin borde).
export const elevationBorderAlpha = [0, 0.06, 0.08, 0.1] as const

// Halo cyan (acción #38bdf8) para estados activos y capas luminosas en dark.
// Reutilizable: overlays (nivel 2/3), botón Primary activo, contenedores activos.
export const glow = {
  subtle: '0 0 16px rgba(56, 189, 248, 0.12)',
  strong: '0 0 20px rgba(56, 189, 248, 0.4)',
} as const

// Relleno de los inputs — recesado respecto de la superficie (fill propio del DS).
export const inputColors = {
  dark: { fill: '#0d1c2d', fillDisabled: '#0a1826', textDisabled: '#87929a' },
  light: { fill: '#f4f5f6', fillDisabled: '#eceef0', textDisabled: '#9aa1a8' },
} as const

// ──────────────────────────────────────────────────────────────────────────────
// Breakpoints (custom del DS). Se mapean a las keys estándar de MUI en theme.ts
// para no romper componentes internos que dependen de xs/sm/md/lg/xl.
// ──────────────────────────────────────────────────────────────────────────────

export const breakpoints = {
  mobile: 0,
  tablet: 640,
  desktopSm: 1024,
  desktop: 1280,
  wide: 1440,
} as const

// ──────────────────────────────────────────────────────────────────────────────
// Motion — duraciones (ms) y curvas de easing
// ──────────────────────────────────────────────────────────────────────────────

export const motion = {
  duration: { fast: 120, base: 200, slow: 320 },
  easing: {
    standard: 'cubic-bezier(0.2, 0, 0, 1)',
    decelerate: 'cubic-bezier(0, 0, 0, 1)',
    accelerate: 'cubic-bezier(0.3, 0, 1, 1)',
  },
} as const

// ──────────────────────────────────────────────────────────────────────────────
// Color — roles por tema. Dark es el tema canónico; light es derivado.
// ──────────────────────────────────────────────────────────────────────────────

export const roleColors = {
  dark: {
    background: '#051424',
    surface: '#122131', // surface-container
    containerHighest: '#273647',
    primary: '#38bdf8', // primario (acción)
    accent: '#8ed5ff', // acento (marca)
    onSurface: '#d4e4fa',
    onSurfaceVariant: '#bdc8d1',
    outlineVariant: '#3e484f',
  },
  light: {
    background: '#f8f9fa',
    surface: '#ffffff',
    containerHighest: '#e1e3e4',
    primary: '#00629d', // navy sólido — CTA con texto blanco (AA ~5:1)
    accent: '#00a3ff', // sky — solo acento (nunca texto blanco encima, ~2.6:1)
    onSurface: '#191c1d',
    onSurfaceVariant: '#3f4852',
    outlineVariant: '#bec7d4',
  },
} as const

export type ThemeMode = keyof typeof roleColors

// ──────────────────────────────────────────────────────────────────────────────
// Color — semánticos. Cada estado expone tonos light (container/base/strong/text)
// y dark (base/text). En dark el fondo del badge es `base` al 12%.
// Regla de uso: nunca color solo — siempre color + ícono o texto.
// ──────────────────────────────────────────────────────────────────────────────

export const semanticColors = {
  success: {
    containerL: '#d1fae5',
    baseL: '#10b981',
    strongL: '#059669',
    textL: '#065f46',
    baseD: '#34d399',
    textD: '#a7f3d0',
  },
  warning: {
    containerL: '#fef3c7',
    baseL: '#f59e0b',
    strongL: '#d97706',
    textL: '#92400e',
    baseD: '#fbbf24',
    textD: '#fde68a',
  },
  error: {
    containerL: '#ffe4e6',
    baseL: '#f43f5e',
    strongL: '#e11d48',
    textL: '#9f1239',
    baseD: '#fb7185',
    textD: '#fecdd3',
  },
  info: {
    containerL: '#e0f2fe',
    baseL: '#0ea5e9',
    strongL: '#0284c7',
    textL: '#0c4a6e',
    baseD: '#38bdf8',
    textD: '#bae6fd',
  },
  neutral: {
    containerL: '#f1f5f9',
    baseL: '#64748b',
    strongL: '#475569',
    textL: '#1e293b',
    baseD: '#94a3b8',
    textD: '#cbd5e1',
  },
} as const

export type SemanticColor = keyof typeof semanticColors
