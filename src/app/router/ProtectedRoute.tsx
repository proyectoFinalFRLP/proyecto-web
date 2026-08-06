import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from 'shared/store'

/**
 * Guard de las rutas privadas. Sin sesión válida no se renderiza nada del
 * dashboard: se redirige al login, incluso si la URL se escribió a mano.
 */
export function ProtectedRoute() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const location = useLocation()

  if (!isAuthenticated) {
    // Se guarda el destino pedido para volver ahí después de iniciar sesión, en
    // lugar de dejar siempre al usuario en el inicio.
    return (
      <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}` }} />
    )
  }

  return <Outlet />
}
