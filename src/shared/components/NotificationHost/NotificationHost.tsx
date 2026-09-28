import { Snackbar } from '@mui/material'

import { useNotificationStore } from '../../store/notificationStore'

import { Toast } from './NotificationHost.styles'

const AUTO_HIDE_MS = 6000

/**
 * Único punto de render de las notificaciones de la app. Se monta una vez en los
 * providers; cualquier capa (incluido el interceptor HTTP) notifica con
 * `notify()`, que escribe en el store.
 *
 * Cada notificación es un toast: el aviso del sistema del diseño (el `Alert`
 * del tema) con su ícono de intención y el botón de cierre.
 */
export function NotificationHost() {
  const notifications = useNotificationStore((state) => state.notifications)
  const dismiss = useNotificationStore((state) => state.dismiss)

  // Se muestra una a la vez: apiladas se tapan entre sí y ninguna se lee.
  const current = notifications[0]
  if (!current) return null

  return (
    <Snackbar
      key={current.id}
      open
      autoHideDuration={AUTO_HIDE_MS}
      // El Snackbar también avisa `clickaway`: cualquier clic en la pantalla
      // cerraba el toast antes de que se pudiera leer. Se va solo por tiempo,
      // por Esc o por su X.
      onClose={(_, reason) => {
        if (reason !== 'clickaway') dismiss(current.id)
      }}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Toast severity={current.severity} onClose={() => dismiss(current.id)}>
        {current.message}
      </Toast>
    </Snackbar>
  )
}
