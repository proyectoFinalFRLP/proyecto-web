// Copy centralizado de la feature — sin literales sueltos en el JSX.
// El diseño está en inglés, pero el resto de la app está en español (Sidebar,
// catálogo, design system): se traduce por consistencia y queda anotado.

export const authContent = {
  brand: 'PRECISION LOGISTICS',
  heading: 'Bienvenido de nuevo',
  subtitle: 'Ingresá para acceder a tu panel de operaciones.',
  emailLabel: 'Email',
  emailPlaceholder: 'nombre@empresa.com',
  passwordLabel: 'Contraseña',
  submit: 'Ingresar',
  submitting: 'Ingresando…',
  legal: `© ${new Date().getFullYear()} Precision Logistics. Todos los derechos reservados.`,
  errors: {
    emailRequired: 'Ingresá tu email',
    emailInvalid: 'El email no tiene un formato válido',
    passwordRequired: 'Ingresá tu contraseña',
    // El backend responde 401 con un texto en inglés; se traduce acá en vez de
    // mostrárselo crudo al usuario.
    invalidCredentials: 'Email o contraseña incorrectos.',
    unexpected: 'No pudimos iniciar sesión. Probá de nuevo en unos segundos.',
  },
} as const
