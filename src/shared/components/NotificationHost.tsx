import { Alert, Snackbar } from '@mui/material'

import { useNotificationStore } from '../store/notificationStore'

const AUTO_HIDE_MS = 6000

/**
 * Único punto de render de las notificaciones de la app. Se monta una vez en los
 * providers; cualquier capa (incluido el interceptor HTTP) notifica escribiendo
 * en el store.
 *
 * Provisional a propósito: usa `Snackbar` + `Alert` de MUI. Cuando TESIS-68
 * defina el componente Toast del design system, se cambia acá adentro y ningún
 * consumidor se entera.
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
      onClose={() => dismiss(current.id)}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert severity={current.severity} variant="filled" onClose={() => dismiss(current.id)}>
        {current.message}
      </Alert>
    </Snackbar>
  )
}
