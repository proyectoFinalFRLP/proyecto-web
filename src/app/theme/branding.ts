import { getContrastRatio, hslToRgb, rgbToHex } from '@mui/material/styles'
import type { TenantBranding } from 'shared/api'

import { roleColors } from './tokens'
import type { ThemeMode } from './tokens'

// Branding de tenant → paleta. Sólo `primary_color` y `accent_color` entran al
// tema (§5 del contrato): el resto de los tokens del DS —tipografía, radios,
// elevación, escala semántica— es del producto, no de la empresa.

// La config es un jsonb que edita quien carga el seed, así que puede traer
// cualquier cosa en esos campos. Un color que MUI no sabe descomponer no
// degrada: hace explotar `alpha()` y con eso el tema entero, así que lo que no
// es hexadecimal se descarta y se cae al color del DS.
const HEX_COLOR = /^#(?:[0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i

const WHITE_TEXT = '#ffffff'
const DARK_TEXT = roleColors.dark.background

// El mismo umbral que usa MUI por defecto para elegir el texto de un botón.
const CONTRAST_THRESHOLD = 3

export function brandColor(value: string | undefined): string | null {
  if (!value) return null

  const color = value.trim()
  return HEX_COLOR.test(color) ? color : null
}

/**
 * Texto que se lee sobre un color de marca.
 *
 * Antes esto eran dos constantes por modo, y alcanzaba porque el primario lo
 * fijaba el DS. Con un color que elige cada empresa hay que medirlo: para los
 * colores del DS esta función devuelve exactamente los mismos valores que
 * estaban escritos a mano.
 */
export function contrastTextFor(color: string): string {
  return getContrastRatio(color, WHITE_TEXT) >= CONTRAST_THRESHOLD ? WHITE_TEXT : DARK_TEXT
}

// ── Identidad mínima del arranque ────────────────────────────────────────────

const HUES = 360

const SPLASH_TONE = {
  dark: { saturation: 70, lightness: 62 },
  light: { saturation: 62, lightness: 34 },
} as const

// djb2 acotado. No hace falta que sea criptográfico: sólo que sea estable entre
// cargas y que dos slugs distintos caigan lejos.
function hueFromSlug(slug: string): number {
  let hash = 5381
  for (let index = 0; index < slug.length; index += 1) {
    hash = (hash * 33 + slug.charCodeAt(index)) % 100003
  }
  return hash % HUES
}

function hexFromHsl(hue: number, saturation: number, lightness: number): string {
  return rgbToHex(hslToRgb(`hsl(${hue}, ${saturation}%, ${lightness}%)`))
}

/** Nombre provisorio del tenant: el slug con la inicial en mayúscula. */
export function displayNameFromSlug(slug: string): string {
  return slug.charAt(0).toUpperCase() + slug.slice(1)
}

/**
 * Identidad provisoria mientras `/tenant-config` está en vuelo: nombre y color
 * derivados del slug.
 *
 * **No es la marca de la empresa** — es lo único que se puede afirmar sin
 * haber hablado con el backend, y existe para que el primer paint no sea el
 * tema base genérico (§5 del contrato). Cuando llega la config, la reemplaza.
 */
export function brandingFromSlug(slug: string, mode: ThemeMode): TenantBranding {
  const hue = hueFromSlug(slug)
  const { saturation, lightness } = SPLASH_TONE[mode]

  return {
    display_name: displayNameFromSlug(slug),
    primary_color: hexFromHsl(hue, saturation, lightness),
    accent_color: hexFromHsl(hue, saturation, mode === 'dark' ? lightness + 12 : lightness + 20),
  }
}
