// Copy centralizado de la feature — sin literales sueltos en el JSX.
// El diseño está en inglés, pero el resto de la app está en español (Sidebar,
// catálogo, design system): se traduce por consistencia y queda anotado.

export const authContent = {
  brand: 'ONESTOCK',
  subtitle: 'Ingresá para acceder a tu panel de operaciones.',
  emailLabel: 'Email',
  emailPlaceholder: 'nombre@empresa.com',
  passwordLabel: 'Contraseña',
  submit: 'Ingresar',
  submitting: 'Ingresando…',
  toRegister: '¿No tenés cuenta? Crear cuenta',
  // Copy de S02-Registro. El título de la tarjeta no se toma del diseño: igual
  // que en el login, ahí va el nombre del tenant (TESIS-121), que es posterior
  // a la pantalla dibujada.
  register: {
    subtitle: 'Solicitá acceso al espacio de operación de tu organización.',
    passwordLabel: 'Contraseña',
    passwordConfirmationLabel: 'Confirmar contraseña',
    terms: 'Acepto los términos del servicio y la política de tratamiento de datos.',
    submit: 'Crear cuenta',
    submitting: 'Enviando…',
    toLogin: '¿Ya tenés cuenta? Ingresar',
    sent: {
      title: 'Solicitud enviada',
      // No afirma que la cuenta se creó: el 202 es el mismo si el email ya
      // tenía una, y decir «te creamos la cuenta» delataría la diferencia.
      body: 'Si el correo no tenía una cuenta, tu solicitud quedó pendiente de aprobación. Vas a poder ingresar cuando la habiliten.',
      backToLogin: 'Volver al inicio de sesión',
    },
  },
  theme: {
    toDark: 'Modo oscuro',
    toLight: 'Modo claro',
    ariaLabel: 'Alternar tema',
  },
  legal: `© ${new Date().getFullYear()} OneStock. Todos los derechos reservados.`,
  errors: {
    emailRequired: 'Ingresá tu email',
    emailInvalid: 'El email no tiene un formato válido',
    passwordRequired: 'Ingresá tu contraseña',
    // El backend responde 401 con un texto en inglés; se traduce acá en vez de
    // mostrárselo crudo al usuario.
    invalidCredentials: 'Email o contraseña incorrectos.',
    // El backend frena el login después de 10 intentos en 3 minutos (TESIS-82).
    tooManyAttempts: 'Hubo demasiados intentos. Esperá unos minutos y volvé a probar.',
    unexpected: 'No pudimos iniciar sesión. Probá de nuevo en unos segundos.',
    registerFailed: 'No pudimos enviar tu solicitud. Probá de nuevo en unos segundos.',
    passwordTooShort: 'La contraseña tiene que tener al menos 6 caracteres',
    passwordConfirmationRequired: 'Repetí la contraseña',
    passwordMismatch: 'Las contraseñas no coinciden',
    termsRequired: 'Tenés que aceptar los términos para crear la cuenta',
  },
} as const
