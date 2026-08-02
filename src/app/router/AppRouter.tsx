import { AppLayout } from 'app/layout/AppLayout'
import { Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { LoadingSpinner } from 'shared/components'

import { bareRoutes, shellRoutes } from './routes'

function NotFoundRedirect() {
  return <Navigate to="/" replace />
}

export function AppRouter() {
  return (
    <Suspense fallback={<LoadingSpinner fullScreen />}>
      <Routes>
        <Route element={<AppLayout />}>
          {shellRoutes.map((route) => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}
          <Route path="*" element={<NotFoundRedirect />} />
        </Route>
        {bareRoutes.map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}
      </Routes>
    </Suspense>
  )
}
