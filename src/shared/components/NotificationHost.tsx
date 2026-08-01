import { Alert, Snackbar } from '@mui/material'
import { useNotificationStore } from 'shared/store'

/**
 * Punto único donde se renderizan las notificaciones de la app. Se monta una
 * sola vez en el layout; cualquier capa (incluidos los interceptores de Axios,
 * que están fuera de React) emite con `notify()`.
 */
export function NotificationHost() {
  const notifications = useNotificationStore((state) => state.notifications)
  const dismiss = useNotificationStore((state) => state.dismiss)

  // Se muestra de a una: la siguiente entra cuando la anterior se cierra.
  const current = notifications[0]
  if (!current) return null

  return (
    <Snackbar
      key={current.id}
      open
      autoHideDuration={6000}
      onClose={() => dismiss(current.id)}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert
        severity={current.severity}
        variant="filled"
        onClose={() => dismiss(current.id)}
        sx={{ width: '100%' }}
      >
        {current.message}
      </Alert>
    </Snackbar>
  )
}
