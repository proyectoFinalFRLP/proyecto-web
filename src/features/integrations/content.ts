// Copy centralizado de la feature — sin literales sueltos en el JSX (mismo
// criterio que `features/inventory/content.ts`).

export const integrationsCopy = {
  page: {
    title: 'Integraciones',
    subtitle: 'Conectá tus canales de venta y operadores logísticos con tu cuenta de cada uno.',
    error: 'No pudimos cargar las integraciones.',
    retry: 'Reintentar',
    empty: 'No hay proveedores disponibles para conectar.',
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
  actions: {
    connect: 'Conectar',
    configure: 'Configurar',
    test: 'Probar conexión',
    testing: 'Probando…',
    activate: 'Activar',
    deactivate: 'Desactivar',
    disconnect: 'Desconectar',
  },
  feedback: {
    saved: (name: string) => `${name} quedó conectado.`,
    testOk: (message: string) => `Conexión verificada. ${message}`,
    testFailed: (message: string) => `La conexión falló: ${message}`,
    activated: (name: string) => `${name} activado.`,
    deactivated: (name: string) => `${name} desactivado.`,
    disconnected: (name: string) => `${name} desconectado.`,
  },
  modal: {
    title: (name: string) => `Conectar ${name}`,
    subtitle: 'Los datos los pide el proveedor. Las credenciales se guardan cifradas.',
    close: 'Cerrar',
    cancel: 'Cancelar',
    save: 'Guardar',
    saving: 'Guardando…',
    credentials: 'Credenciales',
    settings: 'Configuración',
    secretLoaded: 'Ya está cargado. Dejalo vacío para no cambiarlo.',
    oauthHint:
      'OneStock obtiene y renueva solo el token de acceso con estas credenciales: no hace falta pegar un token.',
    noFields: 'Este proveedor no pide datos para conectarse.',
  },
  // Códigos que devuelve la API en `fields` (ver Integrations::ApplyDeclaredFields).
  fieldErrors: {
    required: 'Este dato es obligatorio.',
    invalid_format: 'El formato no es válido.',
    unknown: 'Este dato no corresponde a la integración.',
    fallback: 'Revisá este dato.',
  },
  disconnect: {
    title: (name: string) => `Desconectar ${name}`,
    description:
      'Se borran las credenciales y deja de sincronizar. La configuración y los productos vinculados se conservan para volver a conectar sin rehacer nada.',
    confirm: 'Desconectar',
    cancel: 'Cancelar',
    close: 'Cerrar',
  },
} as const
