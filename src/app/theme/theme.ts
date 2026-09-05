import { alpha, createTheme } from '@mui/material/styles'
import type { PaletteOptions, SimplePaletteColorOptions, ThemeOptions } from '@mui/material/styles'
import type { TenantBranding } from 'shared/api'

import { brandColor, contrastTextFor } from './branding'
import { buildComponents } from './components'
import {
  breakpoints,
  elevationBorderAlpha,
  elevationShadow,
  fontFamily,
  glow,
  layerColors,
  layout,
  motion,
  radius,
  roleColors,
  semanticColors,
  typographyScale,
} from './tokens'
import type { SemanticColor, ThemeMode, TypeSpec, TypographyToken } from './tokens'
import { rem } from './utils'

// ── Tipografía ────────────────────────────────────────────────────────────────

function typeVariant(token: TypographyToken) {
  const t: TypeSpec = typographyScale[token]
  return {
    fontFamily: t.family === 'mono' ? fontFamily.mono : fontFamily.sans,
    fontSize: rem(t.fontSize),
    fontWeight: t.fontWeight,
    lineHeight: t.lineHeight,
    // Ausentes en casi toda la escala: se omiten en vez de mandar `undefined`,
    // que en un objeto de estilos de MUI pisa el valor heredado.
    ...(t.letterSpacing ? { letterSpacing: t.letterSpacing } : {}),
    ...(t.textTransform ? { textTransform: t.textTransform } : {}),
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
  labelCaps: typeVariant('labelCaps'),
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

// `primary` y `secondary` no salen de la escala semántica, así que hay que
// derivarles los tonos `container`/`onContainer` a mano: sin esto cualquier
// componente que los lea (chips, cajones de ícono) recibe `undefined` y no pinta
// fondo. El bug apareció con el primer consumidor de `primary` como tono, porque
// StatusBadge sólo usa estados semánticos.
//
// `strong` queda deliberadamente sin definir: `muiButton` lo usa como opt-in
// para el fondo del botón sólido en light y, al setearlo, el hover perdería su
// oscurecido. Los semánticos sí lo traen y ahí el comportamiento es el buscado.
function brandTones(main: string) {
  return {
    container: alpha(main, 0.12),
    onContainer: main,
  }
}

// El branding del tenant entra por acá y sólo por acá: pisa el primario y el
// acento, y nada más. El texto que va encima se mide en vez de fijarse por modo
// (ver `contrastTextFor`), porque con un color por empresa la regla "en light va
// blanco" deja de valer.
function tenantRoles(mode: ThemeMode, branding?: TenantBranding) {
  const role = roleColors[mode]
  return {
    primary: brandColor(branding?.primary_color) ?? role.primary,
    accent: brandColor(branding?.accent_color) ?? role.accent,
  }
}

function buildPalette(mode: ThemeMode, branding?: TenantBranding): PaletteOptions {
  const role = roleColors[mode]
  const { primary, accent } = tenantRoles(mode, branding)
  return {
    mode,
    primary: {
      main: primary,
      contrastText: contrastTextFor(primary),
      ...brandTones(primary),
    },
    secondary: { main: accent, contrastText: contrastTextFor(accent), ...brandTones(accent) },
    success: semanticPalette(mode, 'success'),
    warning: semanticPalette(mode, 'warning'),
    error: semanticPalette(mode, 'error'),
    info: semanticPalette(mode, 'info'),
    neutral: semanticPalette(mode, 'neutral'),
    background: {
      default: role.background,
      paper: role.surface,
      containerHighest: role.containerHighest,
      // Escala de profundidad nombrada del DS v4.2 (ver `layerColors`). Convive
      // con `paper`/`containerHighest`, no los reemplaza.
      layer: layerColors[mode],
    },
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

/**
 * Tema de la app. `branding` es la config del tenant activo: sin él sale el tema
 * del DS tal cual, con él se repintan primario y acento.
 */
export function createAppTheme(mode: ThemeMode, branding?: TenantBranding) {
  return createTheme({
    cssVariables: true,
    elevation: buildElevation(mode),
    palette: buildPalette(mode, branding),
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
    mixins: {
      toolbar: {
        minHeight: layout.topNavHeight,
      },
    },
    // El acento resuelto también viaja a los overrides: el anillo de foco y el
    // borde del input enfocado lo leen de los tokens, no de la paleta, y sin
    // esto la pantalla de login quedaría con el celeste del DS alrededor de los
    // campos de una empresa que es verde.
    components: buildComponents(mode, tenantRoles(mode, branding).accent),
  })
}
