// Copy centralizado de la feature — sin literales sueltos en el JSX. Mismo
// criterio que `features/inventory/content.ts`: si más adelante entra i18n,
// este módulo es el único punto a migrar a claves de traducción.

export const ordersCopy = {
  page: {
    title: 'Órdenes',
    subtitle: 'Seguimiento y procesamiento de la operación diaria.',
    searchLabel: 'Buscar órdenes',
    searchPlaceholder: 'Buscar por ID o destino',
    create: 'Crear orden',
    tableLabel: 'Listado de órdenes',
    empty: 'No hay órdenes que coincidan con el filtro.',
    error: 'No pudimos cargar las órdenes.',
  },
  tabs: {
    all: 'Todas',
    pending: 'Pendientes',
    paid: 'Pagadas',
    cancelled: 'Canceladas',
  },
  columns: {
    id: 'ID de orden',
    date: 'Fecha y hora',
    destination: 'Destino',
    status: 'Estado',
    carrier: 'Operador logístico',
    total: 'Total',
    actions: 'Acciones',
  },
  status: {
    pending: 'Pendiente',
    paid: 'Pagada',
    cancelled: 'Cancelada',
  },
  actions: {
    view: 'Ver',
    edit: 'Editar',
    /** Etiqueta accesible del kebab de cada fila. */
    menuFor: (orderId: string) => `Acciones de la orden ${orderId}`,
  },
  cells: {
    /** El courier se asigna al confirmar el despacho: antes de eso no hay. */
    noCarrier: 'Sin asignar',
    /** Una venta cargada a mano puede no tener dirección. */
    noDestination: 'Sin destino',
    noTotal: '—',
  },
  pagination: {
    previous: 'Página anterior',
    next: 'Página siguiente',
    page: (page: number) => `Ir a la página ${page}`,
    /** "Mostrando 1 a 20 de 4.829 órdenes". */
    summary: (from: number, to: number, total: number) =>
      `Mostrando ${from} a ${to} de ${formatCount(total)} ${total === 1 ? 'orden' : 'órdenes'}`,
  },
}

/** Miles con punto, como el resto de los números de la pantalla. */
export function formatCount(value: number): string {
  return new Intl.NumberFormat('es-AR').format(value)
}
