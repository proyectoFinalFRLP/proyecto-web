import { useMutation, useQueryClient } from '@tanstack/react-query'
import { integrationKeys } from 'shared/api'
import type { ApiRequestError } from 'shared/api'

import {
  disconnectIntegration,
  saveIntegration,
  setIntegrationActive,
  testIntegration,
} from '../api'
import type { ConnectionPayload, ConnectionTestResult } from '../api'

// Todas invalidan la raíz de integraciones: el listado lo comparten esta
// pantalla, el panel y el detalle de producto, y los tres tienen que ver el
// estado nuevo.
function useInvalidateIntegrations() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: integrationKeys.all })
}

export function useSaveIntegration() {
  const invalidate = useInvalidateIntegrations()

  return useMutation<void, ApiRequestError, { serviceId: number; payload: ConnectionPayload }>({
    mutationFn: ({ serviceId, payload }) => saveIntegration(serviceId, payload),
    onSuccess: invalidate,
  })
}

export function useToggleIntegration() {
  const invalidate = useInvalidateIntegrations()

  return useMutation<void, ApiRequestError, { serviceId: number; isActive: boolean }>({
    mutationFn: ({ serviceId, isActive }) => setIntegrationActive(serviceId, isActive),
    onSuccess: invalidate,
  })
}

// La prueba puede completar configuración que faltaba (en Shopify, la ubicación
// de stock), así que también refresca el listado.
export function useTestIntegration() {
  const invalidate = useInvalidateIntegrations()

  return useMutation<ConnectionTestResult, ApiRequestError, number>({
    mutationFn: testIntegration,
    onSuccess: invalidate,
  })
}

export function useDisconnectIntegration() {
  const invalidate = useInvalidateIntegrations()

  return useMutation<void, ApiRequestError, number>({
    mutationFn: disconnectIntegration,
    onSuccess: invalidate,
  })
}
