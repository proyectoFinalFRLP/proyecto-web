import { AppLayout } from 'app/layout/AppLayout'
import { Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { LoadingSpinner } from 'shared/components'

import { HomePageLazy } from './routes'

function NotFoundPage() {
  return <Navigate to="/" replace />
}

export function AppRouter() {
  return (
    <Suspense fallback={<LoadingSpinner fullScreen />}>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePageLazy />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  )
}
