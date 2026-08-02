// Copy centralizado del TopNavBar — sin literales sueltos en el JSX
// (docs/guidelines/component-structure.md §4).
export const topNavContent = {
  brandLabel: 'PRECISION LOGISTICS',
  toggleSidebarAriaLabel: 'Alternar navegación lateral',
  darkModeLabel: 'Modo oscuro',
  lightModeLabel: 'Modo claro',
  toggleThemeAriaLabel: 'Alternar tema',
  notificationsAriaLabel: 'Notificaciones',
  settingsAriaLabel: 'Configuración',
  searchPlaceholder: 'Buscar órdenes...',
  searchAriaLabel: 'Búsqueda global',
  openSearchAriaLabel: 'Abrir búsqueda',
  closeSearchAriaLabel: 'Cerrar búsqueda',
  userMenuAriaLabel: 'Cuenta de usuario',
  genericUserName: 'Usuario',
  profileLabel: 'Mi perfil',
  logoutLabel: 'Cerrar sesión',
} as const
