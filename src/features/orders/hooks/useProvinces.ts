import { useQuery } from '@tanstack/react-query'

import { fetchProvinces } from '../api'
import { provinceKeys } from '../queryKeys'

/**
 * Las provincias del select de destino. Es un vocabulario fijo del backend
 * (`Order::PROVINCES`): se pide una vez por sesión y no se vuelve a validar.
 */
export function useProvinces() {
  return useQuery<string[]>({
    queryKey: provinceKeys.all(),
    queryFn: fetchProvinces,
    staleTime: Infinity,
  })
}
