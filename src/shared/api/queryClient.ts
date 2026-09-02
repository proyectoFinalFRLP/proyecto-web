import { QueryClient } from '@tanstack/react-query'

/**
 * Cliente de React Query a nivel de módulo.
 *
 * Vive acá y no dentro de `Providers` para que capas fuera del árbol de React
 * puedan vaciarlo. Hace falta por multi-tenancy: el JWT lleva `company_id`, así
 * que si el usuario A de la empresa 1 cierra sesión y entra el usuario B de la
 * empresa 2, una cache viva del tenant anterior se le muestra a B hasta el
 * primer refetch. En una OMS eso es filtración de datos entre empresas, no una
 * molestia de UX.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})
