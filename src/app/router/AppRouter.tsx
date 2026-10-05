import { AppLayout } from 'app/layout/AppLayout'
import { Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { ErrorBoundary, LoadingSpinner } from 'shared/components'

import { ProtectedRoute } from './ProtectedRoute'
import { bareRoutes, shellRoutes } from './routes'

function NotFoundRedirect() {
  return <Navigate to="/" replace />
}

export function AppRouter() {
  return (
    <Suspense fallback={<LoadingSpinner fullScreen />}>
      <Routes>
        {/* Rutas públicas sin shell. Llevan su propio ErrorBoundary porque el de
            AppLayout envuelve al Outlet privado: sin esto, un error de render en
            el login dejaría la pantalla en blanco en lugar del ErrorFallback. El
            `key` hace que el boundary se remonte (y resete) al navegar entre
            rutas bare. */}
        {bareRoutes.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={<ErrorBoundary key={route.path}>{route.element}</ErrorBoundary>}
          />
        ))}

        {/* El resto exige sesión antes de montar el shell. El catch-all vive acá
            adentro, así una URL desconocida sin sesión también cae al login. */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            {shellRoutes.map((route) => (
              <Route key={route.path} path={route.path} element={route.element} />
            ))}
            <Route path="*" element={<NotFoundRedirect />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  )
}
