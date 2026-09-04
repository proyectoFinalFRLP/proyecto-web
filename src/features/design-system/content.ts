import type { ButtonProps, TypographyProps } from '@mui/material'
import type {
  ProgressTone,
  StatComparison,
  StatTone,
  StatTrend,
  StatusBadgeSize,
  StatusFeedEntry,
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
    layers: {
      title: 'Luminous layering',
      subtitle: 'Relleno de cada plano de profundidad — Floor, Deck y Modal',
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
    compact: {
      title: 'Alta densidad y marca',
      subtitle: 'Status Feed, acciones glass y arquitectura del logo',
    },
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
    dataTable: {
      title: 'Tabla de datos estándar',
      subtitle: 'Pestañas, selección, badges de estado, acciones por fila y paginación',
    },
  },
  progressGroups: {
    load: 'Columna Load — canal neutro',
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
  { variant: 'labelCaps', sample: 'Status: operational', note: 'label-caps · 12/700 · caps' },
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

// Planos del luminous layering. `elevation` es el índice del TRATAMIENTO (borde,
// sombra, halo) con el que se muestra cada muestra: el plano 0 va con el nivel 1
// y no con el 0 porque el nivel 0 no dibuja borde y, sobre el fondo de página
// —que es exactamente ese color—, la muestra quedaría invisible.
//
// Los hex no se listan acá: los lee la página desde `palette.background.layer`,
// que es el único origen. Duplicarlos en el catálogo los dejaría desactualizados
// en cuanto el token cambie (y `features` no puede importar de `app/`).
export type LayerKey = 'floor' | 'deck' | 'modal'

export const layerLevels: { key: LayerKey; elevation: number; label: string }[] = [
  { key: 'floor', elevation: 1, label: 'Layer 0 · Floor' },
  { key: 'deck', elevation: 2, label: 'Layer 1 · Deck' },
  { key: 'modal', elevation: 3, label: 'Layer 2 · Modal' },
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

// Filas de la columna Load del spec: el valor es la ocupación y el tono, el
// estado del envío. Con canal neutro las tres barras comparten la referencia
// de 100%, que es lo que permite compararlas de un vistazo.
export const loadSamples: { label: string; value: number; tone: ProgressTone }[] = [
  { label: '#LX-00234', value: 100, tone: 'primary' },
  { label: '#LX-00235', value: 65, tone: 'primary' },
  { label: '#LX-00236', value: 12, tone: 'error' },
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

// Muestras del Status Feed. `current` marca la entrada vigente: no se deduce de
// la posición, la decide quien consume el feed.
export const statusFeedSample: StatusFeedEntry[] = [
  {
    id: 1,
    title: 'Sincronización de inventario completada.',
    meta: 'hace 2 min • Región: EMEA-NORTH',
    current: true,
  },
  {
    id: 2,
    title: 'Actualización por lote encolada para el manifiesto #8821.',
    meta: 'hace 15 min • Usuario: SYS_BOT_04',
  },
  {
    id: 3,
    title: 'Reintento de webhook agotado para la integración #4.',
    meta: 'hace 41 min • Origen: courier-andreani',
  },
]

export const compactGroups = {
  feed: 'System Status Feed',
  actions: 'Action buttons — variante glass',
  logo: 'Arquitectura del logo',
} as const

export const glassActions = {
  primary: 'Crear envío',
  secondary: 'Exportar CSV',
  tertiary: 'Filtros',
} as const

export const logoSpec = {
  brand: 'Precision',
  tagline: 'Logistics',
  rules: [
    { label: 'Área de respeto', value: "Clearance: 1× la altura de la 'P'" },
    { label: 'Color de marca', value: 'Primary (luminescente)' },
    { label: 'Tamaño mínimo', value: 'Web: 140px | Print: 25mm' },
  ],
} as const

// Opciones del dropdown de cambio de estado (badge clickeable).
export const statusOptions: { status: StatusVariant; label: string }[] = [
  { status: 'info', label: 'En tránsito' },
  { status: 'success', label: 'Entregado' },
  { status: 'warning', label: 'Retenido en aduana' },
  { status: 'error', label: 'Demorado' },
]

// ── Tabla de datos estándar (TESIS-70) ───────────────────────────────────────
// Muestras del catálogo. Los importes y las fechas llegan ya formateados: la
// tabla no formatea nada, cada columna decide cómo se pinta su celda.

export interface DemoOrder {
  id: string
  placedAt: string
  destination: string
  status: StatusVariant
  statusLabel: string
  total: string
  /** `critical` tiñe la fila, `muted` la atenúa. */
  tone: 'default' | 'critical' | 'muted'
}

export const dataTableTabs = [
  { id: 'all', label: 'Todas' },
  { id: 'processing', label: 'En preparación', count: '342' },
  { id: 'transit', label: 'En tránsito', count: '1,2K' },
  { id: 'exceptions', label: 'Excepciones', count: '18' },
]

export const dataTableOrders: DemoOrder[] = [
  {
    id: '#ORD-8829-X',
    placedAt: '24 oct, 09:14',
    destination: 'Frankfurt, DE',
    status: 'info',
    statusLabel: 'En preparación',
    total: '$14.250,00',
    tone: 'default',
  },
  {
    id: '#ORD-8828-A',
    placedAt: '24 oct, 08:45',
    destination: 'Austin, TX, US',
    status: 'success',
    statusLabel: 'En tránsito',
    total: '$8.120,50',
    tone: 'default',
  },
  {
    id: '#ORD-8821-E',
    placedAt: '23 oct, 23:20',
    destination: 'Londres, UK',
    status: 'error',
    statusLabel: 'Retenida en aduana',
    total: '$45.000,00',
    tone: 'critical',
  },
  {
    id: '#ORD-8815-C',
    placedAt: '23 oct, 14:15',
    destination: 'Seattle, WA, US',
    status: 'neutral',
    statusLabel: 'Entregada',
    total: '$2.400,00',
    tone: 'muted',
  },
  {
    id: '#ORD-8812-Y',
    placedAt: '23 oct, 13:10',
    destination: 'Tokio, JP',
    status: 'info',
    statusLabel: 'En preparación',
    total: '$88.300,00',
    tone: 'default',
  },
]

export const dataTableCopy = {
  label: 'Órdenes recientes',
  columns: {
    id: 'ID de orden',
    placedAt: 'Fecha y hora',
    destination: 'Destino',
    status: 'Estado',
    total: 'Total',
  },
  actionsHeader: 'Acciones',
  actions: { edit: 'Modificar', view: 'Ver', remove: 'Eliminar' },
  rowActions: (orderId: string) => `Acciones de la orden ${orderId}`,
  selectAll: 'Seleccionar todas las órdenes',
  selectRow: 'Seleccionar orden',
  toolbar: { filter: 'Filtrar', columns: 'Columnas' },
  summary: (from: number, to: number, total: string) =>
    `Mostrando ${from} a ${to} de ${total} órdenes`,
  totalOrders: '4.829',
  previous: 'Página anterior',
  next: 'Página siguiente',
  page: (page: number) => `Ir a la página ${page}`,
  selectedCount: (count: number) => `${count} seleccionadas`,
} as const
