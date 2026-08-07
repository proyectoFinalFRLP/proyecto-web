import type { ButtonProps, TypographyProps } from '@mui/material'
import type {
  ProgressTone,
  StatComparison,
  StatTone,
  StatTrend,
  StatusBadgeSize,
  StatusVariant,
  TopNavUser,
} from 'shared/components'

// Copy centralizado del catálogo — evitamos literales sueltos en el JSX.
// Si más adelante sumamos i18n, este módulo es el punto único a migrar a claves
// de traducción (ver ADR-007).

export const dsCopy = {
  pageTitle: 'Design System — Precision OMS',
  pageSubtitle: 'Catálogo de tokens y componentes del design system.',
  sections: {
    typography: { title: 'Tipografía', subtitle: 'Plus Jakarta Sans + Space Grotesk' },
    elevation: {
      title: 'Elevación',
      subtitle: '4 niveles (0-3) — glow cyan en overlays sobre dark',
    },
    buttons: {
      title: 'Botones — intención × jerarquía',
      subtitle: 'Cualquier intención se combina con cualquier jerarquía',
    },
    buttonIcons: { title: 'Botones con ícono', subtitle: 'Ícono + texto y solo ícono' },
    sizes: {
      title: 'Tamaños y estados',
      subtitle: 'sm 32 · md 40 · lg 48 — deshabilitado neutraliza la intención',
    },
    inputs: { title: 'Inputs', subtitle: 'Focus ring celeste; estados default / disabled / error' },
    badges: { title: 'Status badges', subtitle: 'Siempre color + texto; el ícono es opcional' },
    topNav: {
      title: 'Navegación superior',
      subtitle: 'TopNavBar — shell global: brand, búsqueda, acciones y usuario',
    },
    stats: {
      title: 'Tarjetas de estadísticas',
      subtitle: 'KPI con tendencia, comparativa y formato condensado',
    },
    progress: {
      title: 'Indicadores de progreso',
      subtitle: 'Tono semántico + variantes thin, pasos, indeterminado y skeleton',
    },
    dataPanels: {
      title: 'Paneles de integración de datos',
      subtitle: 'Los primitivos compuestos, con datos de muestra',
    },
  },
  progressGroups: {
    semantic: 'Estados semánticos',
    variants: 'Variantes y estados de carga',
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
  {
    variant: 'bodyLg',
    sample: 'Texto largo para descripciones y contexto.',
    note: 'body-lg · 16/400',
  },
  {
    variant: 'bodyMd',
    sample: 'Texto de UI por defecto — celdas y menús.',
    note: 'body-md · 14/400',
  },
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

// Niveles de la escala de elevación (theme.elevation[level]).
export const elevationLevels: { level: number; label: string }[] = [
  { level: 0, label: '0 · base' },
  { level: 1, label: '1 · card' },
  { level: 2, label: '2 · dropdown' },
  { level: 3, label: '3 · modal' },
]

export const inputSamples: {
  label: string
  placeholder?: string
  defaultValue?: string
  helperText?: string
  disabled?: boolean
  error?: boolean
}[] = [
  { label: 'SKU', placeholder: 'LOG-2938-PX' },
  { label: 'Deshabilitado', defaultValue: 'ORD-8829A', disabled: true },
  { label: 'Email', defaultValue: 'foo@', helperText: 'Email inválido', error: true },
]

// Métricas de muestra del catálogo. `icon` se resuelve en la página: content.ts
// es un módulo de datos y no lleva JSX.
export type StatSampleKey = 'shipments' | 'speed' | 'damaged' | 'fleet'

export const statCardSamples: {
  key: StatSampleKey
  label: string
  value: string
  tone?: StatTone
  tag?: string
  trend?: StatTrend
  comparison?: StatComparison
}[] = [
  { key: 'shipments', label: 'Envíos activos', value: '12.840', tag: 'EN VIVO' },
  { key: 'speed', label: 'Demora promedio', value: '2,4 días', trend: { value: 14.2 } },
  {
    key: 'damaged',
    label: 'Mercadería dañada',
    value: '0,42%',
    tone: 'error',
    // Que baje es una mejora: el tono del chip se fuerza para no pintar de rojo
    // una buena noticia.
    trend: { value: -2.8, tone: 'success' },
  },
  {
    key: 'fleet',
    label: 'Eficiencia de flota',
    value: '94,8%',
    comparison: {
      currentLabel: 'Actual',
      currentValue: '94,8%',
      previousLabel: 'Anterior',
      previousValue: '91,2%',
    },
  },
]

export type CompactSampleKey = 'onTime' | 'distance' | 'carbon'

export const compactStatSamples: {
  key: CompactSampleKey
  label: string
  value: string
  tone?: StatTone
}[] = [
  { key: 'onTime', label: 'En fecha', value: '98,2%', tone: 'success' },
  { key: 'distance', label: 'Km recorridos', value: '42,5k' },
  { key: 'carbon', label: 'CO₂ evitado', value: '1,2 t', tone: 'success' },
]

export const progressSamples: { label: string; value: number; tone: ProgressTone }[] = [
  { label: 'Salud del sistema', value: 85, tone: 'info' },
  { label: 'Capacidad de almacenamiento', value: 72, tone: 'warning' },
  { label: 'Exactitud de inventario', value: 99, tone: 'success' },
  { label: 'Tasa de demoras críticas', value: 45, tone: 'error' },
]

export const progressVariants = {
  thin: 'Densidad condensada',
  indeterminate: 'Estado indeterminado',
  steps: 'Progreso por pasos',
  skeleton: 'Placeholder de carga',
} as const

export const stepsSample = {
  total: 5,
  completed: 3,
  caption: 'Etapa 3 de 5: validación final',
} as const

// Panel "Real-time Fulfillment Performance" del spec.
export const fulfillmentPanel = {
  title: 'Rendimiento de preparación en vivo',
  subtitle: 'Seguimiento del procesamiento en los depósitos.',
} as const

export const fulfillmentRegions: { label: string; value: number; tone: ProgressTone }[] = [
  { label: 'Región NA', value: 92, tone: 'info' },
  { label: 'Región EU', value: 88, tone: 'info' },
  { label: 'Región APAC', value: 76, tone: 'neutral' },
]

// Tarjeta "Operational Status" del spec.
export const operationalStatus = {
  eyebrow: 'Estado operativo',
  headline: 'Totalmente optimizado',
  latencyLabel: 'Latencia de nodo',
  latencyValue: '12 ms',
  throughputLabel: 'Rendimiento',
  throughputValue: '8,4 GB/s',
  load: 65,
  // Nombre accesible de la barra: no tiene label visible en el diseño.
  loadLabel: 'Carga del nodo',
  action: 'Ver logs completos',
} as const

// Sample data del demo de TopNavBar.
export const topNavDemoUser: TopNavUser = { name: 'Ana Torres' }
export const topNavDemoNotifications = 3

// Opciones del dropdown de cambio de estado (badge clickeable).
export const statusOptions: { status: StatusVariant; label: string }[] = [
  { status: 'info', label: 'En tránsito' },
  { status: 'success', label: 'Entregado' },
  { status: 'warning', label: 'Retenido en aduana' },
  { status: 'error', label: 'Demorado' },
]
