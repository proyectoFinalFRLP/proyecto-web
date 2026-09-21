// Copy centralizado de la feature — sin literales sueltos en el JSX. Mismo
// criterio que `features/orders/content.ts`: si más adelante entra i18n, este
// módulo es el único punto a migrar a claves de traducción.

export const reportsCopy = {
  page: {
    title: 'Reportes',
    subtitle: 'Volumen, facturación y cumplimiento de la operación.',
    /** Distintivo junto al título mientras la API no expone agregados. */
    sampleData: 'Datos de muestra',
    sampleDataHint: 'La API todavía no expone agregados de reportes: los valores son ilustrativos.',
    error: 'No pudimos cargar los reportes.',
  },
  period: {
    /** Nombre accesible del selector de período. */
    label: 'Período del reporte',
    options: {
      '7d': 'Últimos 7 días',
      '30d': 'Últimos 30 días',
      '90d': 'Últimos 90 días',
    },
  },
  actions: {
    export: 'Exportar reporte',
    /** Sin endpoint de exportación: la acción queda visible y apagada. */
    exportPending: 'El reporte todavía no se puede exportar desde el sistema.',
  },
  // Vocabulario y orden del diseño (S14-Reportes).
  kpis: {
    dispatchedUnits: 'Volumen despachado',
    revenue: 'Facturación',
    onTimeDelivery: 'Cumplimiento de entregas',
    activeAnomalies: 'Anomalías activas',
    critical: 'Crítico',
  },
  curve: {
    title: 'Curva de despacho',
    /** Nombre accesible del segmentado que elige la serie. */
    metricLabel: 'Serie de la curva',
    metrics: {
      orders: 'Órdenes',
      revenue: 'Facturación',
    },
    /** Descripción del gráfico para el lector de pantalla. */
    chartLabel: (metric: string) => `Curva de despacho: ${metric.toLowerCase()} por día`,
  },
  serviceLevel: {
    title: 'Nivel de servicio',
    subtitle: 'Entregas en plazo por operador logístico.',
    barLabel: (carrier: string) => `Entregas en plazo de ${carrier}`,
  },
  anomalies: {
    title: 'Anomalías recientes',
    tableLabel: 'Anomalías regionales recientes',
    viewLog: 'Ver bitácora completa',
    /** No hay pantalla de bitácora: la acción queda visible y apagada. */
    viewLogPending: 'La bitácora de anomalías todavía no existe en el sistema.',
    columns: {
      id: 'Incidente',
      node: 'Nodo',
      varianceType: 'Tipo de desvío',
      impactedUnits: 'Volumen impactado',
      status: 'Estado',
    },
    status: {
      investigating: 'En análisis',
      critical: 'Crítico',
      resolved: 'Resuelto',
    },
    empty: 'No hay anomalías registradas en el período.',
  },
} as const
