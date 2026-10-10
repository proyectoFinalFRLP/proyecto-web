import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ApiRequestError } from 'shared/api'

import { fetchProductMappings, linkProduct, unlinkProduct } from '../api'
import { inventoryKeys } from '../queryKeys'
import type { LinkProductPayload, LinkProductResult, ProductMapping } from '../types'

export function useProductMappings(productId: number) {
  return useQuery<ProductMapping[]>({
    queryKey: inventoryKeys.mappings(productId),
    queryFn: () => fetchProductMappings(productId),
  })
}

export function useLinkProduct(productId: number) {
  const queryClient = useQueryClient()

  return useMutation<LinkProductResult, ApiRequestError, LinkProductPayload>({
    mutationFn: (payload) => linkProduct(productId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: inventoryKeys.mappings(productId) }),
  })
}

export function useUnlinkProduct(productId: number) {
  const queryClient = useQueryClient()

  return useMutation<void, ApiRequestError, number>({
    mutationFn: (mappingId) => unlinkProduct(productId, mappingId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: inventoryKeys.mappings(productId) }),
  })
}
