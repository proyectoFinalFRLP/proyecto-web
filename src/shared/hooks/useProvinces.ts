import { useQuery } from '@tanstack/react-query'

import { fetchProvinces, provinceKeys } from '../api/provinces'

/**
 * Las provincias de los selects de domicilio: el destino de la orden y el
 * depósito. Es un vocabulario fijo del backend (`Order::PROVINCES`): se pide una
 * vez por sesión, no se vuelve a validar y las dos pantallas comparten la caché.
 */
export function useProvinces() {
  return useQuery<string[]>({
    queryKey: provinceKeys.all,
    queryFn: fetchProvinces,
    staleTime: Infinity,
  })
}
