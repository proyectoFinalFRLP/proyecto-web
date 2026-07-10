import type { ButtonProps, TypographyProps } from '@mui/material'
import type { StatusBadgeSize, StatusVariant } from 'shared/components'

// Copy centralizado del catálogo — evitamos literales sueltos en el JSX.
// Si más adelante sumamos i18n, este módulo es el punto único a migrar a claves
// de traducción (ver ADR-007).

export const dsCopy = {
  pageTitle: 'Design System — Precision OMS',
  pageSubtitle: 'Catálogo de tokens y componentes del design system: tipografía, botones y badges.',
  sections: {
    typography: { title: 'Tipografía', subtitle: 'Plus Jakarta Sans + Space Grotesk' },
    buttons: {
      title: 'Botones — intención × jerarquía',
      subtitle: 'Cualquier intención se combina con cualquier jerarquía',
    },
    buttonIcons: { title: 'Botones con ícono', subtitle: 'Ícono + texto y solo ícono' },
    sizes: { title: 'Tamaños y estados', subtitle: 'sm 32 · md 40 · lg 48 — deshabilitado neutraliza la intención' },
    badges: { title: 'Status badges', subtitle: 'Siempre color + texto; el ícono es opcional' },
  },
  badgeGroups: {
    withoutIcon: 'Sin ícono',
    withIcon: 'Con ícono',
    sizes: 'Tamaños — sm · md · lg',
    interactive: 'Clickeable (dropdown de estado)',
  },
  labels: {
    action: 'Acción',
    newOrder: 'Nueva orden',
    export: 'Exportar CSV',
    disabled: 'Deshabilitado',
    viewDetails: 'Ver detalles',
    edit: 'Editar',
    delete: 'Eliminar',
  },
} as const

export const typeSpecs: { variant: TypographyProps['variant']; sample: string; note: string }[] = [
  { variant: 'displayLg', sample: 'Operaciones globales', note: 'display-lg · 48/700' },
  { variant: 'displaySm', sample: 'Resumen de operaciones', note: 'display-sm · 32/700' },
  { variant: 'h1', sample: 'Título de página', note: 'h1 · 24/600' },
  { variant: 'h2', sample: 'Título de card', note: 'h2 · 20/600' },
  { variant: 'h3', sample: 'Subsección', note: 'h3 · 18/600' },
  { variant: 'bodyLg', sample: 'Texto largo para descripciones y contexto.', note: 'body-lg · 16/400' },
  { variant: 'bodyMd', sample: 'Texto de UI por defecto — celdas y menús.', note: 'body-md · 14/400' },
  { variant: 'labelMd', sample: 'Labels, tabs y headers', note: 'label-md · 12/600' },
  { variant: 'labelSm', sample: 'Captions y metadatos', note: 'label-sm · 11/500' },
  { variant: 'dataMono', sample: '#ORD-8829A · SKU LOG-2938-PX', note: 'data-mono · 14/500' },
]

export const buttonIntents: { label: string; color: ButtonProps['color'] }[] = [
  { label: 'Marca', color: 'primary' },
  { label: 'Success', color: 'success' },
  { label: 'Warning', color: 'warning' },
  { label: 'Error', color: 'error' },
  { label: 'Neutral', color: 'neutral' },
]

export const buttonHierarchies: { label: string; variant: ButtonProps['variant'] }[] = [
  { label: 'Sólido', variant: 'contained' },
  { label: 'Outline', variant: 'outlined' },
  { label: 'Ghost', variant: 'text' },
]

export const badgeSamples: { status: StatusVariant; label: string }[] = [
  { status: 'success', label: 'Entregado' },
  { status: 'info', label: 'En tránsito' },
  { status: 'warning', label: 'Stock bajo' },
  { status: 'error', label: 'Demorado' },
  { status: 'neutral', label: 'Archivado' },
]

export const badgeSizes: StatusBadgeSize[] = ['sm', 'md', 'lg']

// Opciones del dropdown de cambio de estado (badge clickeable).
export const statusOptions: { status: StatusVariant; label: string }[] = [
  { status: 'info', label: 'En tránsito' },
  { status: 'success', label: 'Entregado' },
  { status: 'warning', label: 'Retenido en aduana' },
  { status: 'error', label: 'Demorado' },
]
