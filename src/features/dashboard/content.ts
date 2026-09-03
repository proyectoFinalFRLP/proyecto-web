// Copy centralizado de la feature — evitamos literales sueltos en el JSX (misma
// idea que `content.ts` de design-system: si mañana sumamos i18n, este módulo es
// el único punto a migrar a claves de traducción).
export const dashboardCopy = {
  pageTitle: 'Panel de operación',
  pageSubtitle: 'Datos en vivo de los centros de distribución.',
  infra: {
    health: {
      // Vocabulario del diseño (S03-Panel): "Salud del sistema", no "de infraestructura".
      label: 'Salud del sistema',
      unknownValue: '—',
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
  error: {
    fallback: 'No se pudo cargar el estado de las integraciones.',
    retry: 'Reintentar',
  },
} as const
