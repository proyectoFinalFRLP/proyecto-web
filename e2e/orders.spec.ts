import { expect, test } from '@playwright/test'

import { fillCustomerAndProducts } from './support/orderWizard'
import { NORTE_PRODUCT, NORTE_WAREHOUSE, uniqueSuffix } from './support/seeds'
import { bodyRows, expectEveryRowToShow } from './support/tables'

test.describe('orders list', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/orders')
    await expect(page.getByRole('heading', { name: 'Órdenes', level: 1 })).toBeVisible()
  })

  test('filters the orders by status', async ({ page }) => {
    const orders = page.getByRole('table', { name: 'Listado de órdenes' })

    await page.getByRole('tab', { name: /^Canceladas/ }).click()

    await expectEveryRowToShow(orders, 'Cancelada')
  })

  test('pages through the orders', async ({ page }) => {
    const orders = page.getByRole('table', { name: 'Listado de órdenes' })
    const summary = page.getByText(/^Mostrando \d+ a \d+ de [\d.]+ órdenes$/)

    // Los seeds de Norte traen más de una página de órdenes (20 por página).
    await expect(summary).toHaveText(/^Mostrando 1 a 20 de [\d.]+ órdenes$/)
    const firstOrder = await bodyRows(orders).first().getByRole('button').first().textContent()

    await page.getByRole('button', { name: 'Página siguiente' }).click()

    await expect(summary).toHaveText(/^Mostrando 21 a \d+ de [\d.]+ órdenes$/)
    await expect(bodyRows(orders).first()).not.toContainText(firstOrder ?? '')
  })
})

test.describe('manual order wizard', () => {
  test('creates a pickup order in three steps and opens its detail', async ({ page }) => {
    // Retiro en el local: el paso 3 no cotiza con ningún operador, así que el
    // alta completa no depende de una red externa (ver el test de courier).
    const customer = { firstName: 'Retiro', lastName: `E2E ${uniqueSuffix()}` }
    await fillCustomerAndProducts(page, customer)

    await page.getByRole('radio', { name: /^Retiro en el local/ }).check()
    await page.getByRole('button', { name: 'Siguiente: confirmación' }).click()

    await expect(page.getByText('Paso 3 de 3')).toBeVisible()
    const summary = page.getByRole('region', { name: 'Resumen de la orden' })
    await expect(summary).toContainText('Lo retira en')
    await expect(summary).toContainText(NORTE_WAREHOUSE)
    await expect(summary).toContainText('$ 3.000,00')

    await summary.getByRole('button', { name: 'Confirmar orden' }).click()

    // Vuelve al listado y avisa con el número que le tocó a la orden.
    const notice = page.getByRole('alert').filter({ hasText: /creada/ })
    await expect(notice).toHaveText(/^Orden #\d+ creada\. El cliente la retira en el local\.$/)
    const orderLabel = (await notice.textContent())?.match(/#\d+/)?.[0] ?? ''
    await expect(page).toHaveURL(/\/orders$/)

    // La encuentra la búsqueda por cliente…
    await page.getByRole('textbox', { name: 'Buscar órdenes' }).fill(customer.lastName)
    const orders = page.getByRole('table', { name: 'Listado de órdenes' })
    await expect(bodyRows(orders)).toHaveCount(1)
    const row = bodyRows(orders).first()
    await expect(row).toContainText(orderLabel)
    await expect(row).toContainText('Retiro en el local')

    // …y el detalle tiene lo que se cargó en el asistente.
    await row.getByRole('button', { name: orderLabel, exact: true }).click()
    await expect(page.getByRole('heading', { name: `Orden ${orderLabel}` })).toBeVisible()
    const main = page.getByRole('main')
    await expect(main).toContainText(`${customer.firstName} ${customer.lastName}`)
    await expect(main).toContainText(NORTE_PRODUCT.sku)
    await expect(main).toContainText('$ 3.000,00')
    await expect(main).toContainText('El cliente retira esta orden en el local. No lleva envío.')
  })

  test('quotes the shipment with a courier and confirms the order', async ({ page }) => {
    // En los seeds de desarrollo Norte cotiza con el entorno de QA público de
    // OCA, por red. Si OCA no contesta, el test se marca como salteado en vez
    // de fallar: lo que se prueba es el front, no la disponibilidad de OCA.
    test.setTimeout(120_000)
    const customer = { firstName: 'Envío', lastName: `E2E ${uniqueSuffix()}` }
    await fillCustomerAndProducts(page, customer)

    await page.getByRole('radio', { name: /^Envío a domicilio/ }).check()
    await page.getByRole('textbox', { name: 'Calle y número' }).fill('Av. Corrientes 3247')
    await page.getByRole('textbox', { name: 'Ciudad' }).fill('CABA')
    await page.getByRole('combobox', { name: 'Provincia' }).click()
    await page.getByRole('option', { name: 'Ciudad Autónoma de Buenos Aires' }).click()
    await page.getByRole('textbox', { name: 'Código postal' }).fill('1193')
    await page.getByRole('button', { name: 'Siguiente: cotizaciones' }).click()

    await expect(page.getByText('Paso 3 de 3')).toBeVisible()
    const quotes = page.getByRole('radiogroup', { name: 'Operadores logísticos cotizados' })
    const noQuote = page.getByText(
      /No pudimos cotizar el envío|Ningún operador logístico pudo cotizar este envío/,
    )
    await expect(quotes.or(noQuote)).toBeVisible({ timeout: 45_000 })
    test.skip(
      await noQuote.isVisible(),
      'OCA no devolvió cotizaciones: el entorno externo no respondió.',
    )

    const cheapest = quotes.getByRole('radio').first()
    const courier = (await cheapest.getAttribute('aria-label')) ?? (await cheapest.textContent())
    await cheapest.check()

    const summary = page.getByRole('region', { name: 'Resumen de la orden' })
    await expect(summary).not.toContainText('Elegí un operador')
    await summary.getByRole('button', { name: 'Confirmar orden' }).click()

    // La orden se crea siempre; el despacho lo emite OCA y puede fallar por su
    // lado. Las dos salidas son respuestas válidas del front.
    const dispatched = page.getByRole('alert').filter({ hasText: /creada y despachada con/ })
    const notDispatched = page.getByText(/se creó, pero no pudimos emitir el despacho/)
    await expect(dispatched.or(notDispatched)).toBeVisible({ timeout: 45_000 })
    if (await notDispatched.isVisible()) {
      test.info().annotations.push({
        type: 'warning',
        description: `La orden se creó pero OCA no emitió el despacho (${courier ?? 'courier'}).`,
      })
      return
    }

    // Despachada: el envío aparece en el listado de envíos, con el operador
    // elegido y listo para que lo retire.
    const orderLabel = (await dispatched.textContent())?.match(/#\d+/)?.[0] ?? ''
    await page.getByRole('link', { name: 'Envíos', exact: true }).click()
    await page.getByRole('textbox', { name: 'Buscar' }).fill(orderLabel)
    const shipments = page.getByRole('table', { name: 'Envíos de la empresa' })
    const shipment = bodyRows(shipments).filter({
      has: page.getByRole('cell', { name: `Orden ${orderLabel}`, exact: true }),
    })
    await expect(shipment).toContainText('Listo para despachar')
  })
})
