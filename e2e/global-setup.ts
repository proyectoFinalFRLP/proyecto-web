// Antes de correr nada, la API tiene que estar arriba: sin ella todos los tests
// fallan por timeout y el motivo real queda enterrado en cada traza.
export default async function globalSetup() {
  const apiURL = process.env.E2E_API_URL ?? 'http://localhost:3000/api/v1'
  const health = new URL('/up', apiURL)

  try {
    const response = await fetch(health)
    if (response.ok) return
    throw new Error(`respondió ${response.status}`)
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error)
    throw new Error(
      `La API no responde en ${health.href} (${reason}). Levantala con los seeds ` +
        '(`bin/rails db:seed` y `bin/rails s`) antes de correr `npm run test:e2e`.',
    )
  }
}
