import { useQuery } from '@tanstack/react-query'
import type { ApiResponse } from 'shared/api'
import { client } from 'shared/api/client'

import { integrationKeys } from '../queryKeys'
import type { IntegrationNode } from '../types'

/**
 * El estado de las integraciones de la empresa.
 *
 * Viene envuelto en `data` como toda colección de la API (ADR-015 del
 * backend). Hasta TESIS-107 era el único listado que contestaba un array
 * pelado, y este hook tenía el comentario que lo recordaba: ese comentario era
 * el síntoma de que la regla no existía.
 */
export function useIntegrations() {
  return useQuery<IntegrationNode[]>({
    queryKey: integrationKeys.lists(),
    queryFn: async () => {
      const { data } = await client.get<ApiResponse<IntegrationNode[]>>('/integrations')
      return data.data
    },
  })
}
