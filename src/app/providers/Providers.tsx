import { QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { queryClient } from 'shared/api'
import { NotificationHost } from 'shared/components'

import { TenantGate } from './TenantGate'
import { ThemeWrapper } from './ThemeWrapper'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {/* El tema envuelve al gate y no al revés: el splash y la pantalla de
            tenant desconocido también se pintan con la identidad del tenant. */}
        <ThemeWrapper>
          <TenantGate>
            {children}
            {/* Único host de notificaciones de la app: lo alimenta el store, así el
                interceptor HTTP puede avisar sin estar en el árbol de React. */}
            <NotificationHost />
          </TenantGate>
        </ThemeWrapper>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
