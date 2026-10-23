import { defineConfig, devices } from '@playwright/test'

// Tests de punta a punta (TESIS-94). Corren contra el stack real: la API de
// Rails con los seeds de desarrollo y el front servido por Vite. Cómo se
// levanta todo está en docs/guidelines/testing.md §7.

/** URL donde se sirve el front. Si no hay nada escuchando ahí, Playwright levanta Vite. */
const baseURL = process.env.E2E_BASE_URL ?? 'http://localhost:5173'

/** La API contra la que habla el front que levanta Playwright (no la que ya estuviera corriendo). */
const apiURL = process.env.E2E_API_URL ?? 'http://localhost:3000/api/v1'

const isCI = Boolean(process.env.CI)

export default defineConfig({
  testDir: './e2e',
  // Los tests escriben en la misma base (productos, órdenes): en serie, cada uno
  // ve lo que dejó el anterior y nada pisa a nada.
  fullyParallel: false,
  workers: 1,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  reporter: isCI ? [['list'], ['html', { open: 'never' }]] : 'list',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  globalSetup: './e2e/global-setup.ts',
  use: {
    ...devices['Desktop Chrome'],
    // En local, el Chrome instalado (no hace falta bajar navegadores). En el
    // CI no hay Chrome: se instala el Chromium de Playwright.
    channel: isCI ? undefined : 'chrome',
    baseURL,
    locale: 'es-AR',
    timezoneId: 'America/Argentina/Buenos_Aires',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    // Inicia sesión una vez y guarda el localStorage: el resto de los tests
    // arrancan con la sesión abierta en vez de pasar por el login cada vez.
    { name: 'setup', testMatch: /auth\.setup\.ts/ },
    {
      name: 'chromium',
      dependencies: ['setup'],
      use: { storageState: 'e2e/.auth/admin.json' },
    },
  ],
  webServer: {
    command: `npm run dev -- --port ${new URL(baseURL).port || '5173'} --strictPort`,
    url: baseURL,
    // En local se reusa el `npm run dev` que ya esté abierto.
    reuseExistingServer: !isCI,
    timeout: 120_000,
    env: { VITE_API_URL: apiURL, VITE_TENANT: 'norte' },
  },
})
