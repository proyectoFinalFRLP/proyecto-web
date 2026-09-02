import { useQuery } from '@tanstack/react-query'
import { client } from 'shared/api/client'
import type { ApiResponse } from 'shared/api/types'

import { orderKeys } from '../queryKeys'
import type { Order } from '../types'

export function useOrders() {
  return useQuery<Order[]>({
    queryKey: orderKeys.lists(),
    queryFn: async () => {
      const { data } = await client.get<ApiResponse<Order[]>>('/orders')
      return data.data
    },
  })
}
