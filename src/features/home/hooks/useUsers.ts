import { useQuery } from '@tanstack/react-query'
import { client } from 'shared/api/client'
import type { ApiResponse } from 'shared/api/types'
import type { User } from '../types'

export function useUsers() {
  return useQuery<User[]>({
    queryKey: ['users'],
    queryFn: async () => {
      const { data } = await client.get<ApiResponse<User[]>>('/users')
      return data.data
    },
  })
}
