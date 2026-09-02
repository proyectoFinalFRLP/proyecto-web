import { useQuery } from '@tanstack/react-query'
import { client } from 'shared/api/client'
import type { ApiResponse } from 'shared/api/types'

import { shipmentKeys } from '../queryKeys'
import type { Shipment } from '../types'

export function useShipments() {
  return useQuery<Shipment[]>({
    queryKey: shipmentKeys.lists(),
    queryFn: async () => {
      const { data } = await client.get<ApiResponse<Shipment[]>>('/shipments')
      return data.data
    },
  })
}
