import { AppLayout } from 'app/layout/AppLayout'
import { Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { LoadingSpinner } from 'shared/components'

import { ProtectedRoute } from './ProtectedRoute'
import { appRoutes, publicRoutes } from './routes'

function NotFoundRedirect() {
  return <Navigate to="/" replace />
}

export function AppRouter() {
  return (
    <Suspense fallback={<LoadingSpinner fullScreen />}>
      <Routes>
        {publicRoutes.map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}

        {/* El resto de las rutas exige sesión: el guard corre antes del layout. */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            {appRoutes.map((route) => (
              <Route key={route.path} path={route.path} element={route.element} />
            ))}
            <Route path="*" element={<NotFoundRedirect />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  )
}
