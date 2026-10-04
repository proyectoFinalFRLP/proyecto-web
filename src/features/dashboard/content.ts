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
    // Reemplaza al KPI de «Salud del sistema» (TESIS-163): la misma salud de
    // las integraciones, dicha como un número sobre el que se puede actuar.
    // Reemplaza al KPI de «Salud del sistema» (TESIS-163), que mostraba un
    // porcentaje derivado de la frescura de los nodos. Las unidades guardadas
    // son el inventario del que vive la operación, y salen del mismo dato que
    // ya alimenta la carga por depósito: ni un request más.
    storedUnits: {
      label: 'Unidades en stock',
      note: (warehouses: number) =>
        warehouses === 1 ? 'en 1 depósito' : `repartidas en ${warehouses} depósitos`,
    },
    // Cuarta tarjeta de la fila del diseño. El chip y la nota son los del
    // MetricCard de S03-Panel; el tono `error` es lo que le da el borde de
    // acento que el diseño marca como `critical`.
    inventoryAlerts: {
      label: 'Alertas de inventario',
      tag: 'Crítico',
      // La nota dice de qué está hecho el número: agotados y por debajo del
      // umbral no son lo mismo y se trabajan distinto, pero los dos son alerta.
      note: (outOfStock: number, low: number) =>
        outOfStock === 0
          ? `${UNITS_FORMAT.format(low)} por debajo del umbral`
          : `${UNITS_FORMAT.format(outOfStock)} sin stock · ${UNITS_FORMAT.format(low)} por debajo del umbral`,
      // Sin productos en alerta la tarjeta no grita: el borde rojo y el chip
      // «Crítico» afirmarían un problema que no existe.
      calmNote: 'Sin productos en alerta de stock',
      // Nombre accesible del enlace. Lleva el dato adentro: un `aria-label`
      // reemplaza al contenido para un lector de pantalla, así que si dijera
      // sólo «ver los productos» se perdería el número y el chip «Crítico»,
      // que es lo único que la tarjeta existe para comunicar.
      linkLabel: (total: string, calm: boolean) =>
        calm
          ? `Alertas de inventario: ${total}. Ver el catálogo`
          : `Alertas de inventario: ${total}, crítico. Ver los productos en alerta`,
    },
  },
  // Carga de cada depósito (TESIS-55). El diseño titula esta tarjeta
  // «Capacidad por depósito» y dibuja un porcentaje de ocupación; acá dice
  // «Carga» porque no hay capacidad máxima en el modelo de datos y llamarle
  // capacidad a una comparación entre depósitos sería describir mal el número.
  warehouses: {
    title: 'Carga por depósito',
    caption: (units: number) =>
      `${UNITS_FORMAT.format(units)} ${units === 1 ? 'unidad guardada' : 'unidades guardadas'}`,
    units: (units: number) => `${UNITS_FORMAT.format(units)} u`,
    // Con capacidad declarada (TESIS-162) se muestra la ocupación; sin ella, lo
    // guardado a secas. El rótulo accesible dice contra qué se mide, porque las
    // dos barras se ven igual y significan cosas distintas.
    occupancy: (percentage: number) => `${Math.round(percentage)} % de su capacidad`,
    barLabel: (name: string, units: number) =>
      `${name}: ${UNITS_FORMAT.format(units)} ${units === 1 ? 'unidad' : 'unidades'}`,
    barLabelWithCapacity: (name: string, units: number, capacity: number) =>
      `${name}: ${UNITS_FORMAT.format(units)} de ${UNITS_FORMAT.format(capacity)} unidades de capacidad`,
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
  // La tarjeta «Últimos envíos» reemplaza a la de Integraciones (TESIS-163):
  // las conexiones las administra el equipo, no la empresa, y lo que sí le
  // sirve al operador es qué salió y con quién.
  shipments: {
    title: 'Últimos envíos',
    subtitle: (count: number) => (count === 1 ? '1 envío reciente' : `${count} envíos recientes`),
    empty: 'Todavía no se despachó ningún envío.',
    noCourier: 'Sin operador asignado',
    noTracking: 'Sin seguimiento',
    /** "Orden #8829" — nombre accesible de la fila. */
    order: (id: number) => `Orden #${id}`,
    // El destino se declara acá y no se importa del router: una feature no
    // puede depender de `app/` (architecture.md §3.2).
    orderPath: (id: number) => `/orders/${id}`,
    status: {
      pending: 'Pendiente',
      ready_to_ship: 'Listo para despachar',
      in_transit: 'En tránsito',
      delivered: 'Entregado',
    },
  },
  error: {
    fallback: 'No se pudieron cargar algunas métricas del panel.',
    retry: 'Reintentar',
  },
} as const
