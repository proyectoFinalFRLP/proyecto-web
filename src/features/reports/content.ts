// Copy centralizado de la feature — sin literales sueltos en el JSX. Mismo
// criterio que `features/orders/content.ts`: si más adelante entra i18n, este
// módulo es el único punto a migrar a claves de traducción.

export const reportsCopy = {
  page: {
    title: 'Reportes',
    subtitle: 'Volumen, facturación y cumplimiento de la operación.',
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
  },
  /**
   * El CSV del reporte: lo que muestra la pantalla para el período elegido,
   * bloque por bloque. Los rótulos dicen la unidad, porque en la planilla el
   * número va crudo y sin formato.
   */
  export: {
    /** "reporte-30d-2026-10-19.csv". */
    filename: (period: string, to: string) => `reporte-${period}-${to}.csv`,
    title: 'Reporte de la operación',
    period: 'Período',
    from: 'Desde',
    to: 'Hasta',
    kpis: {
      header: ['Métrica', 'Valor', 'Variación vs. período anterior (%)'],
      revenue: 'Facturación ($)',
      dispatchedUnits: 'Volumen despachado (unidades)',
      onTimeDelivery: 'Cumplimiento de entregas (%)',
      /** Ninguna entrega del período tenía fecha comprometida. */
      onTimeUnavailable: 'Sin entregas con fecha comprometida',
      activeAnomalies: 'Anomalías activas (hoy)',
      critical: 'Hay al menos una crítica',
    },
    curve: {
      title: 'Curva de ventas',
      header: (granularity: 'day' | 'week') => [
        granularity === 'week' ? 'Semana desde' : 'Día',
        'Órdenes',
        'Facturación ($)',
      ],
    },
    carriers: {
      title: 'Entregas por operador',
      header: ['Operador', 'Despachados', 'Entregados'],
    },
    anomalies: {
      title: 'Envíos demorados',
      header: [
        'Orden',
        'Depósito de origen',
        'Operador',
        'Entrega comprometida',
        'Días de demora',
        'Unidades',
        'Estado',
      ],
    },
  },
  // Vocabulario y orden del diseño (S14-Reportes).
  kpis: {
    dispatchedUnits: 'Volumen despachado',
    revenue: 'Facturación',
    onTimeDelivery: 'Cumplimiento de entregas',
    activeAnomalies: 'Anomalías activas',
    critical: 'Crítico',
    /** Valor de una métrica sin con qué calcularla en el período. */
    unavailable: '—',
    /** `null`: no es un 0%, es que no hubo plazo contra el cual medir. */
    onTimeUnavailable: 'Ninguna entrega del período tenía fecha comprometida.',
    /** Las anomalías activas son de hoy, no del período elegido. */
    anomaliesNote: 'Envíos en curso con la fecha comprometida vencida, hoy.',
  },
  // Órdenes creadas y facturación por día o semana: son ventas, no despachos.
  // Se llamaba «Curva de despacho» y no dibujaba ningún despacho.
  curve: {
    title: 'Curva de ventas',
    /** Nombre accesible del segmentado que elige la serie. */
    metricLabel: 'Serie de la curva',
    metrics: {
      orders: 'Órdenes',
      revenue: 'Facturación',
    },
    /** Descripción del gráfico para el lector de pantalla. */
    chartLabel: (metric: string, granularity: 'day' | 'week') =>
      `Curva de ventas: ${metric.toLowerCase()} por ${granularity === 'week' ? 'semana' : 'día'}`,
  },
  serviceLevel: {
    title: 'Entregas por operador',
    subtitle: 'Envíos despachados en el período que ya llegaron a destino.',
    delivered: (delivered: number, dispatched: number) => `${delivered} de ${dispatched}`,
    barLabel: (carrier: string) => `Envíos entregados de ${carrier}`,
    empty: 'No se despacharon envíos en el período.',
  },
  /** Una anomalía es un envío demorado: pasó su fecha comprometida. */
  anomalies: {
    title: 'Anomalías recientes',
    tableLabel: 'Envíos demorados recientes',
    /** Lleva al listado de envíos filtrado por los demorados. */
    viewLog: 'Ver bitácora completa',
    columns: {
      order: 'Orden',
      origin: 'Depósito de origen',
      courier: 'Operador',
      promised: 'Entrega comprometida',
      units: 'Unidades',
      status: 'Estado',
    },
    /** "4 días de demora": debajo de la fecha comprometida. */
    daysLate: (days: number) => `${days} ${days === 1 ? 'día' : 'días'} de demora`,
    /** Origen u operador que el envío no registra. */
    missing: '—',
    status: {
      investigating: 'En análisis',
      critical: 'Crítico',
      resolved: 'Resuelto',
    },
    empty: 'No hay envíos demorados en el período.',
  },
} as const
