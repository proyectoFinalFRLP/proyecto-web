import { useQuery } from '@tanstack/react-query'

import { fetchIntegrations, integrationKeys } from '../api/integrations'
import type { IntegrationService } from '../api/integrations'

/**
 * Las plantillas conectables con el estado de la integración de la empresa.
 * Una sola query para el panel, la pantalla de integraciones y el detalle de
 * producto: una mutación que invalide `integrationKeys.all` los refresca a los
 * tres.
 */
export function useIntegrations() {
  return useQuery<IntegrationService[]>({
    queryKey: integrationKeys.lists(),
    queryFn: fetchIntegrations,
  })
}
