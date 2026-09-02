// Copy centralizado de la feature — evitamos literales sueltos en el JSX (misma
// idea que `content.ts` de design-system: si mañana sumamos i18n, este módulo es
// el único punto a migrar a claves de traducción).
export const dashboardCopy = {
  pageTitle: 'Operación logística',
  pageSubtitle: 'Métricas de flujo de órdenes y envíos.',
  metrics: {
    pendingOrders: {
      label: 'Órdenes pendientes',
      caption: (total: number) => `sobre ${total} ${total === 1 ? 'orden' : 'órdenes'}`,
    },
    activeShipments: {
      label: 'Envíos activos',
      caption: (total: number) => `sobre ${total} ${total === 1 ? 'envío' : 'envíos'}`,
    },
  },
  infra: {
    health: {
      label: 'Salud de infraestructura',
      unknownValue: '—',
      caption: (online: number, reporting: number) =>
        `${online}/${reporting} ${reporting === 1 ? 'nodo sincronizado' : 'nodos sincronizados'}`,
      noReportsCaption: 'ningún nodo reporta sincronización',
    },
    nodes: {
      title: 'Nodos de integración',
      subtitle: (count: number) =>
        `${count} ${count === 1 ? 'integración activa' : 'integraciones activas'}`,
      empty: 'La empresa no tiene integraciones activas.',
      syncPrefix: 'Sync:',
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
  error: {
    fallback: 'No se pudieron cargar las métricas de la operación.',
    retry: 'Reintentar',
  },
} as const
