import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from 'shared/store'

/**
 * Guard de las rutas privadas. Sin sesión válida no se renderiza el layout: se
 * redirige al login guardando la ruta pedida para volver después del ingreso.
 *
 * También cubre el 401 en caliente: cuando el interceptor limpia la sesión, este
 * componente se vuelve a evaluar y saca al usuario de la vista protegida.
 */
export function ProtectedRoute() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}
