import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { NotificationHost } from 'shared/components'

import { ThemeWrapper } from './ThemeWrapper'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeWrapper>
          {children}
          {/* Único host de notificaciones de la app: lo alimenta el store, así el
              interceptor HTTP puede avisar sin estar en el árbol de React. */}
          <NotificationHost />
        </ThemeWrapper>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
