import { useQuery } from '@tanstack/react-query'
import { client } from 'shared/api/client'

import { integrationKeys } from '../queryKeys'
import type { IntegrationNode } from '../types'

// A diferencia del resto de los hooks de la feature, acá no hay `ApiResponse<T>`:
// `IntegrationsController#index` renderiza el Blueprint directo, así que la
// respuesta es un array plano y no `{ data: [...] }`.
export function useIntegrations() {
  return useQuery<IntegrationNode[]>({
    queryKey: integrationKeys.lists(),
    queryFn: async () => {
      const { data } = await client.get<IntegrationNode[]>('/integrations')
      return data
    },
  })
}
