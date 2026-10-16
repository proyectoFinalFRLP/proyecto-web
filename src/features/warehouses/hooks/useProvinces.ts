import { useQuery } from '@tanstack/react-query'

import { fetchProvinces } from '../api'
import { warehouseKeys } from '../queryKeys'

/**
 * Las provincias del select del depósito. Es un vocabulario fijo del backend
 * (`Order::PROVINCES`): se pide una vez por sesión y no se vuelve a validar.
 */
export function useProvinces() {
  return useQuery<string[]>({
    queryKey: warehouseKeys.provinces(),
    queryFn: fetchProvinces,
    staleTime: Infinity,
  })
}
