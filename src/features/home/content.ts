// Copy centralizado de la feature — sin literales sueltos en el JSX.
// Mismo criterio que `features/inventory/content.ts`: si más adelante entra
// i18n, este módulo es el único punto a migrar a claves de traducción.

export const homeCopy = {
  page: {
    title: 'Precision OMS',
    subtitle: 'Gestión de órdenes, inventario y envíos.',
    /** El email lo confirma la sesión; no se pinta si todavía no hay uno. */
    session: (email: string) => `Sesión iniciada como ${email}`,
  },
  sections: {
    shortcuts: 'Dónde ir',
  },
  shortcuts: {
    inventory: {
      label: 'Inventario',
      description: 'Catálogo de productos y stock consolidado por depósito.',
    },
  },
  // El panel de operación con métricas es TESIS-53 a TESIS-56 y depende de
  // endpoints que la API todavía no expone. Decirlo es más honesto que pintar
  // tarjetas con números inventados.
  pending: 'El panel de operación, con las métricas de la empresa, llega más adelante.',
  designSystem: 'Design System',
} as const
