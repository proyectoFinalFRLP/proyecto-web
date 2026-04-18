import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import { client } from 'shared/api/client'
import type { PaginatedResponse } from 'shared/api/types'
import type { PaginationParams } from 'shared/types'

interface UsePaginatedQueryOptions<T>
  extends Omit<UseQueryOptions<PaginatedResponse<T>>, 'queryKey' | 'queryFn'> {
  endpoint: string
  params?: PaginationParams & Record<string, unknown>
}

export function usePaginatedQuery<T>({
  endpoint,
  params,
  ...options
}: UsePaginatedQueryOptions<T>) {
  return useQuery<PaginatedResponse<T>>({
    queryKey: [endpoint, params],
    queryFn: async () => {
      const { data } = await client.get<PaginatedResponse<T>>(endpoint, {
        params,
      })
      return data
    },
    ...options,
  })
}
