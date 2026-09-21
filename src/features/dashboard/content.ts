// Copy centralizado de la feature — evitamos literales sueltos en el JSX (misma
// idea que `content.ts` de design-system: si mañana sumamos i18n, este módulo es
// el único punto a migrar a claves de traducción).

// Lo que muestra una tarjeta cuando el dato no está: falló la consulta o no hay
// con qué calcularlo. Nunca un 0, que se leería como un dato real.
const UNKNOWN_VALUE = '—'

// Separadores de miles del locale, para las unidades del widget de depósitos.
// El componente del DS recibe el valor ya formateado.
const UNITS_FORMAT = new Intl.NumberFormat('es-AR')

export const dashboardCopy = {
  pageTitle: 'Panel de operación',
  pageSubtitle: 'Datos en vivo de los centros de distribución.',
  // Vocabulario y orden del diseño (S03-Panel).
  metrics: {
    unknownValue: UNKNOWN_VALUE,
    activeShipments: {
      label: 'Envíos activos',
    },
    pendingOrders: {
      label: 'Órdenes pendientes',
    },
    // Cuarta tarjeta de la fila del diseño. El chip y la nota son los del
    // MetricCard de S03-Panel; el tono `error` es lo que le da el borde de
    // acento que el diseño marca como `critical`.
    inventoryAlerts: {
      label: 'Alertas de inventario',
      tag: 'Crítico',
      note: 'Requiere revisión inmediata',
      // Sin productos en alerta la tarjeta no grita: el borde rojo y el chip
      // «Crítico» afirmarían un problema que no existe.
      calmNote: 'Sin productos por debajo del umbral',
      link: 'Ver los productos con stock bajo',
    },
  },
  // Carga de cada depósito (TESIS-55). El diseño titula esta tarjeta
  // «Capacidad por depósito» y dibuja un porcentaje de ocupación; acá dice
  // «Carga» porque no hay capacidad máxima en el modelo de datos y llamarle
  // capacidad a una comparación entre depósitos sería describir mal el número.
  warehouses: {
    title: 'Carga por depósito',
    caption: (units: number) =>
      `${UNITS_FORMAT.format(units)} ${units === 1 ? 'unidad guardada' : 'unidades guardadas'} · la barra compara contra el depósito más cargado`,
    units: (units: number) => `${UNITS_FORMAT.format(units)} u`,
    barLabel: (name: string, units: number) =>
      `${name}: ${UNITS_FORMAT.format(units)} ${units === 1 ? 'unidad' : 'unidades'}`,
    empty: 'La empresa no tiene depósitos cargados.',
  },
  // Tabla de órdenes recientes del panel (TESIS-56). Vocabulario y orden de
  // columnas de S03-Panel.
  recentOrders: {
    title: 'Órdenes recientes',
    tableLabel: 'Últimas órdenes de la empresa',
    viewAll: 'Ver todas',
    empty: 'Todavía no hay órdenes cargadas.',
    loading: 'Cargando las últimas órdenes…',
    noDestination: 'Sin destino',
    noTotal: '—',
    columns: {
      id: 'ID de orden',
      destination: 'Destino',
      total: 'Total',
      status: 'Estado',
      date: 'Fecha',
    },
    // Las mismas etiquetas que usa el listado global: son el vocabulario del
    // producto, no de esta pantalla.
    status: {
      pending: 'Pendiente',
      paid: 'Pagada',
      cancelled: 'Cancelada',
    },
  },
  infra: {
    health: {
      // Vocabulario del diseño (S03-Panel): "Salud del sistema", no "de infraestructura".
      label: 'Salud del sistema',
      unknownValue: UNKNOWN_VALUE,
    },
    nodes: {
      title: 'Integraciones',
      subtitleSynced: (online: number, reporting: number) =>
        `${online}/${reporting} ${reporting === 1 ? 'nodo sincronizado' : 'nodos sincronizados'}`,
      subtitleNoReports: (active: number) =>
        `${active} ${active === 1 ? 'integración activa' : 'integraciones activas'} · sin datos de sincronización`,
      empty: 'La empresa no tiene integraciones activas.',
      // Línea inferior de cada fila. El diseño la usa como frase de estado
      // ("Sincronizado hace 2 ms"), no como un timestamp suelto.
      sync: {
        online: (elapsed: string) => `Sincronizado ${elapsed}`,
        stale: (elapsed: string) => `Sin sincronizar desde ${elapsed}`,
        unknown: 'Sin datos de sincronización',
      },
      // Texto accesible del ícono de estado.
      status: {
        online: 'Sincronizado',
        stale: 'Sincronización atrasada',
        unknown: 'Sin datos de sincronización',
      },
      types: {
        ecommerce: 'E-commerce',
        courier: 'Courier',
      },
    },
  },
  // Sección propia de integraciones, visible sólo para los tenants que tienen
  // la feature encendida (TESIS-121).
  integrationsPage: {
    title: 'Integraciones',
    subtitle: 'Estado de sincronización de los sistemas conectados a tu empresa.',
  },
  error: {
    fallback: 'No se pudieron cargar algunas métricas del panel.',
    retry: 'Reintentar',
  },
} as const
