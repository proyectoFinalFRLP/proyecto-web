import { useQuery } from '@tanstack/react-query'
import { client } from 'shared/api/client'
import type { ApiResponse } from 'shared/api/types'

import { userKeys } from '../queryKeys'
import type { User } from '../types'

export function useUsers() {
  return useQuery<User[]>({
    queryKey: userKeys.lists(),
    queryFn: async () => {
      const { data } = await client.get<ApiResponse<User[]>>('/users')
      return data.data
    },
  })
}
