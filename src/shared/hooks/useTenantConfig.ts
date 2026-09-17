import { useQuery } from '@tanstack/react-query'

import { fetchTenantConfig } from '../api/tenant'
import type { TenantConfig } from '../api/tenant'
import { setTenantConfig, useTenantStore } from '../store/tenantStore'

export const tenantKeys = {
  all: ['tenant'] as const,
  config: (slug: string | null) => [...tenantKeys.all, 'config', slug] as const,
}

/**
 * Trae la config del tenant al arrancar la app. La monta el gate de arranque una
 * sola vez; el resto de la app lee el resultado del `tenantStore`.
 */
export function useTenantConfig() {
  const slug = useTenantStore((state) => state.slug)

  return useQuery<TenantConfig>({
    queryKey: tenantKeys.config(slug),
    queryFn: async () => {
      const config = await fetchTenantConfig()
      // El store es lo que leen el tema, el shell y las rutas; React Query sólo
      // trae el dato. Se escribe acá y no en un efecto para que la config no
      // llegue un render tarde, que en el tema significa un parpadeo de marca.
      setTenantConfig(config)
      return config
    },
    // Sin slug no hay a quién preguntarle: es la pantalla de tenant desconocido,
    // no un request que valga la pena hacer.
    enabled: slug !== null,
    // La config no cambia dentro de una sesión, y un refetch repintaría la app
    // entera sin motivo.
    staleTime: Infinity,
    // Un slug inexistente responde 404 (§3 del contrato): reintentar sólo demora
    // la pantalla de error sin cambiar el desenlace.
    retry: false,
  })
}
