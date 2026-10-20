// Copy centralizado de la feature — sin literales sueltos en el JSX.

import { formatInteger } from 'shared/utils'

export const shipmentsCopy = {
  page: {
    title: 'Envíos',
    subtitle: 'Todos los envíos de la empresa y en qué anda cada uno.',
    error: 'No pudimos cargar los envíos.',
    searchLabel: 'Buscar',
    /** Los dos códigos que el operador tiene en la mano cuando lo llaman. */
    // TESIS-180: también el número que muestra la tienda («#1001»).
    searchPlaceholder: 'Seguimiento o número de orden',
  },
  tabs: {
    all: 'Todos',
    pending: 'Pendientes',
    ready_to_ship: 'Listos para despachar',
    in_transit: 'En tránsito',
    delivered: 'Entregados',
  },
  columns: {
    id: 'Envío',
    order: 'Orden',
    courier: 'Operador logístico',
    tracking: 'Seguimiento',
    cost: 'Costo',
    status: 'Estado',
    createdAt: 'Creado',
    actions: 'Acciones',
  },
  cells: {
    /** El courier se asigna recién al confirmar el despacho (TESIS-47). */
    noCourier: 'Sin asignar',
    noTracking: 'Pendiente de despacho',
    /** Sin cotizar no cuesta cero: no se cotizó. */
    noCost: 'Sin cotizar',
    /** "Envío #31". */
    shipment: (id: number) => `Envío #${id}`,
    /** "Orden #18948032757993": recibe la orden ya nombrada con `formatOrderId`. */
    order: (label: string) => `Orden ${label}`,
    /** En curso y con la fecha comprometida vencida. */
    delayed: 'Demorado',
  },
  /**
   * El filtro de demorados (`/shipments?delayed=true`): lo traen los enlaces de
   * otras pantallas, como «Ver bitácora» de Reportes, y tiene que verse y poder
   * sacarse, o el listado parecería tener menos envíos sin decir por qué.
   */
  delayedFilter: {
    label: 'Sólo demorados',
    clear: 'Quitar el filtro «Sólo demorados»',
  },
  status: {
    pending: 'Pendiente',
    ready_to_ship: 'Listo para despachar',
    in_transit: 'En tránsito',
    delivered: 'Entregado',
  },
  table: {
    label: 'Envíos de la empresa',
    empty: 'No hay envíos para este filtro.',
    /** Buscar y no encontrar no es lo mismo que una pestaña vacía. */
    emptySearch: 'Ningún envío coincide con la búsqueda.',
    /** Con el filtro de demorados, una tabla vacía es una buena noticia. */
    emptyDelayed: 'No hay envíos demorados para este filtro.',
    /** El detalle del envío vive en la orden: no hay pantalla propia. */
    view: 'Ver la orden',
    /** El ojito se repite en cada fila: el nombre accesible dice cuál es. */
    viewFor: (id: number) => `Ver la orden del envío #${id}`,
  },
  pagination: {
    previous: 'Página anterior',
    next: 'Página siguiente',
    page: (number: number) => `Página ${number}`,
    summary: (from: number, to: number, total: number) =>
      `Mostrando ${formatInteger(from)} a ${formatInteger(to)} de ${formatInteger(total)} ${total === 1 ? 'envío' : 'envíos'}`,
  },
} as const
