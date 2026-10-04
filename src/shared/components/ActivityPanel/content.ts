// Copy del panel de actividad — sin literales sueltos en el JSX
// (docs/guidelines/component-structure.md §4).
export const activityContent = {
  title: 'Actividad reciente',
  loading: 'Buscando lo último que pasó…',
  error: 'No pudimos cargar la actividad.',
  retry: 'Reintentar',
  /** Nada que mostrar no es un error: es una empresa que recién arranca. */
  empty: 'Todavía no pasó nada por acá.',
  close: 'Cerrar',
  /** El texto de cada hecho. La API manda el dato; la frase se arma acá. */
  orderCreated: {
    manual: (customer: string) => `Nueva orden de ${customer}`,
    channel: (customer: string, reference: string) => `Nueva venta de ${customer} · ${reference}`,
  },
  shipmentDispatched: {
    withCourier: (courier: string) => `Envío despachado con ${courier}`,
    withoutCourier: 'Envío despachado',
  },
  eventFailed: {
    withIntegration: (integration: string) => `Falló un evento de ${integration}`,
    withoutIntegration: 'Falló un evento de integración',
  },
} as const
