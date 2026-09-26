// Copy centralizado de la feature — sin literales sueltos en el JSX (mismo
// criterio que `features/inventory/content.ts`).

export const integrationsCopy = {
  page: {
    title: 'Integraciones',
    subtitle:
      'Los canales de venta y operadores logísticos conectados a tu empresa. Para conectar uno nuevo o cambiar una cuenta, contactá al equipo de OneStock.',
    error: 'No pudimos cargar las integraciones.',
    retry: 'Reintentar',
    empty: 'No hay proveedores disponibles.',
  },
  groups: {
    ecommerce: 'Canales de venta',
    courier: 'Operadores logísticos',
  },
  status: {
    connected: 'Conectado',
    inactive: 'Inactivo',
    notConnected: 'No conectado',
  },
  account: (name: string) => `Cuenta: ${name}`,
} as const
