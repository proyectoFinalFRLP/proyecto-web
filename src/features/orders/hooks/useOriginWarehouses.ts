import { useQuery } from '@tanstack/react-query'

import { fetchWarehouses } from '../api'
import { catalogKeys } from '../queryKeys'
import type { OriginWarehouse } from '../types'

/** Los depósitos de la empresa, para elegir el origen en el paso 2. */
export function useOriginWarehouses() {
  return useQuery<OriginWarehouse[]>({
    queryKey: catalogKeys.warehouses(),
    queryFn: fetchWarehouses,
  })
}
