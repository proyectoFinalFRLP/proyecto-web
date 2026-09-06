export type TopNavThemeMode = 'light' | 'dark'

export interface TopNavUser {
  /** Nombre completo — fuente de las iniciales cuando no hay `avatarUrl`. */
  name: string
  avatarUrl?: string
}

export interface TopNavBarProps {
  /** Ruta a la que linkea el brand */
  brandTo: string
  /**
   * Nombre de la empresa del tenant, al lado de la marca del producto. Sin esto
   * la barra sólo dice de qué producto se trata, no para quién está configurado.
   */
  organization?: string
  /** Si se define, muestra el botón de hamburguesa para el sidebar. */
  onToggleSidebar?: () => void
  /** Requerido junto a `onToggleTheme` para mostrar el toggle de tema. */
  themeMode?: TopNavThemeMode
  onToggleTheme?: () => void
  /** Contador del badge de notificaciones. Badge oculto si es 0/undefined. */
  notificationsCount?: number
  onNotificationsClick?: () => void
  /** Si se define, muestra el ícono de engranaje linkeando a esta ruta. */
  settingsTo?: string
  /** Datos del usuario. Sin esto, el avatar cae a un ícono genérico. */
  user?: TopNavUser
  onProfileClick?: () => void
  onLogout?: () => void
}
