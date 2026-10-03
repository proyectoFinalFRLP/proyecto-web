// Copy centralizado de la feature — sin literales sueltos en el JSX.
// Mismo criterio que `features/inventory/content.ts`: si más adelante entra
// i18n, este módulo es el único punto a migrar a claves de traducción.

export const homeCopy = {
  page: {
    title: 'OneStock',
    subtitle: 'Gestión de órdenes, inventario y envíos.',
    /** El email lo confirma la sesión; no se pinta si todavía no hay uno. */
    session: (email: string) => `Sesión iniciada como ${email}`,
  },
  sections: {
    shortcuts: 'Dónde ir',
  },
  // Las pantallas del día a día, en el orden en que se recorre la operación:
  // mirar el panel, cargar o revisar ventas, cuidar el stock, analizar.
  shortcuts: {
    dashboard: {
      label: 'Panel de operación',
      description:
        'Envíos activos, salud de las integraciones, alertas de stock y órdenes recientes.',
    },
    newOrder: {
      label: 'Nueva orden',
      description: 'Cargá una venta hecha por fuera de los canales conectados.',
    },
    orders: {
      label: 'Órdenes',
      description: 'Listado de ventas de todos los canales, con su envío.',
    },
    inventory: {
      label: 'Inventario',
      description: 'Catálogo de productos y stock consolidado por depósito.',
    },
    reports: {
      label: 'Reportes',
      description: 'Facturación, volumen despachado y curva del período.',
    },
  },
  designSystem: 'Design System',
} as const
