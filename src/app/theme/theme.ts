import { alpha, createTheme } from '@mui/material/styles'
import type { PaletteOptions, SimplePaletteColorOptions, ThemeOptions } from '@mui/material/styles'

import { buildComponents } from './components'
import {
  breakpoints,
  elevationBorderAlpha,
  elevationShadow,
  fontFamily,
  glow,
  motion,
  radius,
  roleColors,
  semanticColors,
  typographyScale,
} from './tokens'
import type { SemanticColor, ThemeMode, TypographyToken } from './tokens'
import { rem } from './utils'

// ── Tipografía ────────────────────────────────────────────────────────────────

function typeVariant(token: TypographyToken) {
  const t = typographyScale[token]
  return {
    fontFamily: t.family === 'mono' ? fontFamily.mono : fontFamily.sans,
    fontSize: rem(t.fontSize),
    fontWeight: t.fontWeight,
    lineHeight: t.lineHeight,
  }
}

const typography: ThemeOptions['typography'] = {
  fontFamily: fontFamily.sans,
  h1: typeVariant('h1'),
  h2: typeVariant('h2'),
  h3: typeVariant('h3'),
  displayLg: typeVariant('displayLg'),
  displaySm: typeVariant('displaySm'),
  bodyLg: typeVariant('bodyLg'),
  bodyMd: typeVariant('bodyMd'),
  labelMd: typeVariant('labelMd'),
  labelSm: typeVariant('labelSm'),
  dataMono: typeVariant('dataMono'),
}

// ── Paleta ──────────────────────────────────────────────────────────────────

// Cada semántico expone main/light/dark (para MUI) + los tonos del DS
// (container/strong/onContainer). En dark el fondo del badge es `base` al 12%.
function semanticPalette(mode: ThemeMode, key: SemanticColor): SimplePaletteColorOptions {
  const s = semanticColors[key]
  if (mode === 'dark') {
    return {
      main: s.baseD,
      light: alpha(s.baseD, 0.22),
      dark: s.baseD,
      strong: s.baseD,
      container: alpha(s.baseD, 0.12),
      onContainer: s.textD,
      contrastText: '#051424',
    }
  }
  return {
    main: s.baseL,
    light: s.containerL,
    dark: s.strongL,
    strong: s.strongL,
    container: s.containerL,
    onContainer: s.textL,
    contrastText: '#ffffff',
  }
}

function buildPalette(mode: ThemeMode): PaletteOptions {
  const role = roleColors[mode]
  return {
    mode,
    // Regla del primario: en light el CTA es navy con texto blanco; en dark es
    // sky brillante con texto oscuro.
    primary: { main: role.primary, contrastText: mode === 'light' ? '#ffffff' : '#051424' },
    secondary: { main: role.accent, contrastText: '#051424' },
    success: semanticPalette(mode, 'success'),
    warning: semanticPalette(mode, 'warning'),
    error: semanticPalette(mode, 'error'),
    info: semanticPalette(mode, 'info'),
    neutral: semanticPalette(mode, 'neutral'),
    background: { default: role.background, paper: role.surface, containerHighest: role.containerHighest },
    divider: role.outlineVariant,
    text: { primary: role.onSurface, secondary: role.onSurfaceVariant },
  }
}

// ── Elevación ───────────────────────────────────────────────────────────────

// 4 niveles (0-3). Dark: borde blanco creciente + sombra sutil (luminous
// layering). Light: sombra ambiental difusa + borde de bajo contraste.
function buildElevation(mode: ThemeMode) {
  return elevationShadow[mode].map((boxShadow, level) => ({
    // En dark, los niveles overlay (2/3) suman el halo cyan luminoso.
    boxShadow: mode === 'dark' && level >= 2 ? `${boxShadow}, ${glow.subtle}` : boxShadow,
    border:
      level === 0
        ? 'none'
        : mode === 'dark'
          ? `1px solid ${alpha('#ffffff', elevationBorderAlpha[level])}`
          : `1px solid ${roleColors.light.outlineVariant}`,
  }))
}

// ── Tema ──────────────────────────────────────────────────────────────────────

export function createAppTheme(mode: ThemeMode) {
  return createTheme({
    cssVariables: true,
    elevation: buildElevation(mode),
    palette: buildPalette(mode),
    typography,
    shape: { borderRadius: radius.base },
    // Breakpoints del DS mapeados a las keys estándar de MUI (xs/sm/md/lg/xl)
    // para no romper componentes internos que dependen de esas keys.
    breakpoints: {
      values: {
        xs: breakpoints.mobile,
        sm: breakpoints.tablet,
        md: breakpoints.desktopSm,
        lg: breakpoints.desktop,
        xl: breakpoints.wide,
      },
    },
    transitions: {
      duration: {
        shortest: motion.duration.fast,
        shorter: motion.duration.fast,
        short: motion.duration.base,
        standard: motion.duration.base,
        complex: motion.duration.slow,
        enteringScreen: motion.duration.slow,
        leavingScreen: motion.duration.base,
      },
      easing: {
        easeInOut: motion.easing.standard,
        easeOut: motion.easing.decelerate,
        easeIn: motion.easing.accelerate,
        sharp: motion.easing.standard,
      },
    },
    components: buildComponents(mode),
  })
}
