import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

import { fillCustomerAndProducts } from './support/orderWizard'
import { bodyRows } from './support/tables'

// Auditoría automática de accesibilidad (TESIS-91). Recorre las pantallas
// principales en los dos temas y corre axe con las reglas de WCAG 2.1 A y AA.
// Falla con cualquier hallazgo crítico o serio; los moderados y menores quedan
// en el reporte adjunto a cada test. Qué se revisó, qué se corrigió y por qué
// existe cada exclusión está en docs/guidelines/accessibility.md.

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']

const BLOCKING_IMPACTS = new Set(['critical', 'serious'])

/**
 * Exclusiones justificadas: nodos que axe no puede evaluar bien. Cada una tiene
 * su motivo en docs/guidelines/accessibility.md §4; una entrada nueva sin
 * documentar no pasa el review.
 */
const EXCLUDED_SELECTORS: string[] = []

/** Si está definida, guarda una captura de cada pantalla en esa carpeta (para revisarlas a ojo). */
const SCREENSHOTS_DIR = process.env.A11Y_SCREENSHOTS_DIR

type Mode = 'light' | 'dark'

interface Screen {
  name: string
  /** Lleva la página hasta la pantalla y espera a que tenga sus datos. */
  open: (page: Page) => Promise<void>
  /** El login se audita sin sesión. */
  anonymous?: boolean
}

/**
 * Espera a que la pantalla haya terminado de cargar: el título visible y sin
 * pedidos a la API en vuelo. No se espera a que no haya `progressbar`: varias
 * pantallas usan barras de progreso como dato (pasos del alta, nivel de servicio).
 */
async function settle(page: Page, heading: string | RegExp) {
  await expect(page.getByRole('heading', { name: heading, level: 1 })).toBeVisible()
  await page.waitForLoadState('networkidle')
  await page.evaluate(() => document.fonts.ready)
}

const screens: Screen[] = [
  {
    name: 'login',
    anonymous: true,
    open: async (page) => {
      await page.goto('/login')
      await expect(page.getByRole('button', { name: 'Ingresar' })).toBeVisible()
      await page.evaluate(() => document.fonts.ready)
    },
  },
  {
    name: 'panel',
    open: async (page) => {
      await page.goto('/')
      await settle(page, 'Panel de operación')
    },
  },
  {
    name: 'orders-list',
    open: async (page) => {
      await page.goto('/orders')
      await settle(page, 'Órdenes')
      await expect(
        bodyRows(page.getByRole('table', { name: 'Listado de órdenes' })),
      ).not.toHaveCount(0)
    },
  },
  {
    name: 'orders-new-step-1',
    open: async (page) => {
      await page.goto('/orders/new')
      await settle(page, 'Nueva orden')
      await expect(page.getByText('Paso 1 de 3')).toBeVisible()
    },
  },
  {
    name: 'orders-new-step-2',
    open: async (page) => {
      await fillCustomerAndProducts(page, { firstName: 'Axe', lastName: 'Auditoría' })
      await page.getByRole('radio', { name: /^Envío a domicilio/ }).check()
      await expect(page.getByRole('textbox', { name: 'Calle y número' })).toBeVisible()
      await page.waitForLoadState('networkidle')
    },
  },
  {
    name: 'orders-new-step-3',
    open: async (page) => {
      // Retiro en el local: el paso 3 no depende de que un operador externo cotice.
      await fillCustomerAndProducts(page, { firstName: 'Axe', lastName: 'Auditoría' })
      await page.getByRole('radio', { name: /^Retiro en el local/ }).check()
      await page.getByRole('button', { name: 'Siguiente: confirmación' }).click()
      await expect(page.getByText('Paso 3 de 3')).toBeVisible()
      await expect(page.getByRole('region', { name: 'Resumen de la orden' })).toBeVisible()
      await page.waitForLoadState('networkidle')
    },
  },
  {
    name: 'order-detail',
    open: async (page) => {
      await page.goto('/orders')
      const orders = page.getByRole('table', { name: 'Listado de órdenes' })
      const first = bodyRows(orders).first().getByRole('button').first()
      const label = ((await first.textContent()) ?? '').trim()
      await first.click()
      await settle(page, `Orden ${label}`)
    },
  },
  {
    name: 'shipments',
    open: async (page) => {
      await page.goto('/shipments')
      await settle(page, 'Envíos')
      await expect(
        bodyRows(page.getByRole('table', { name: 'Envíos de la empresa' })),
      ).not.toHaveCount(0)
    },
  },
  {
    name: 'inventory',
    open: async (page) => {
      await page.goto('/inventory')
      await settle(page, 'Inventario')
    },
  },
  {
    name: 'warehouses',
    open: async (page) => {
      await page.goto('/warehouses')
      await settle(page, 'Depósitos')
    },
  },
  {
    name: 'reports',
    open: async (page) => {
      await page.goto('/reports')
      await settle(page, 'Reportes')
    },
  },
]

/** Fija el tema antes de que cargue la app, igual que lo guarda el toggle. */
async function useTheme(page: Page, mode: Mode) {
  await page.addInitScript((themeChoice) => {
    localStorage.setItem('ui-store', JSON.stringify({ state: { themeChoice }, version: 0 }))
  }, mode)
}

test.describe('accessibility', () => {
  for (const screen of screens) {
    test.describe(screen.name, () => {
      if (screen.anonymous) test.use({ storageState: { cookies: [], origins: [] } })

      for (const mode of ['light', 'dark'] as const) {
        test(`has no critical or serious axe violations in ${mode} mode`, async ({
          page,
        }, testInfo) => {
          await useTheme(page, mode)
          await screen.open(page)

          let builder = new AxeBuilder({ page }).withTags(WCAG_TAGS)
          for (const selector of EXCLUDED_SELECTORS) builder = builder.exclude(selector)
          const results = await builder.analyze()

          await testInfo.attach('axe-results', {
            body: JSON.stringify(results.violations, null, 2),
            contentType: 'application/json',
          })
          if (SCREENSHOTS_DIR) {
            // Desde arriba: con la página scrolleada, la barra superior fija
            // aparece en el medio de la captura de página completa.
            await page.evaluate(() => window.scrollTo(0, 0))
            await page.screenshot({
              path: `${SCREENSHOTS_DIR}/${screen.name}-${mode}.png`,
              fullPage: true,
            })
          }

          const blocking = results.violations
            .filter((violation) => BLOCKING_IMPACTS.has(violation.impact ?? ''))
            .map((violation) => ({
              rule: violation.id,
              impact: violation.impact,
              help: violation.help,
              nodes: violation.nodes.map((node) => node.target.join(' ')),
            }))

          expect(blocking).toEqual([])
        })
      }
    })
  }
})
