import { client } from 'shared/api/client'

// Frontera con los endpoints de escritura de integraciones (TESIS-139). El
// listado es de `shared/api/integrations`, porque también lo leen el panel y el
// detalle de producto.

/** Lo que carga el formulario de conexión, ya listo para `PUT /integrations/:id`. */
export interface ConnectionPayload {
  credentials: Record<string, string>
  settings: Record<string, string>
}

export interface ConnectionTestResult {
  ok: boolean
  message: string
}

export async function saveIntegration(serviceId: number, payload: ConnectionPayload) {
  await client.put(`/integrations/${serviceId}`, payload)
}

// Activar o desactivar no reenvía credenciales ni configuración: el back
// conserva lo que había (Integrations::UpsertIntegration).
export async function setIntegrationActive(serviceId: number, isActive: boolean) {
  await client.put(`/integrations/${serviceId}`, { is_active: isActive })
}

/** Siempre 200: que el proveedor rechace la cuenta llega como `ok: false`. */
export async function testIntegration(serviceId: number): Promise<ConnectionTestResult> {
  const { data } = await client.post<ConnectionTestResult>(`/integrations/${serviceId}/test`)
  return data
}

export async function disconnectIntegration(serviceId: number) {
  await client.delete(`/integrations/${serviceId}`)
}
