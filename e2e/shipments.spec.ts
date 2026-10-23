import { expect, test } from '@playwright/test'

import { bodyRows, expectEveryRowToShow } from './support/tables'

test.describe('shipments list', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/shipments')
    await expect(page.getByRole('heading', { name: 'Envíos', level: 1 })).toBeVisible()
  })

  test('filters the shipments by status', async ({ page }) => {
    const shipments = page.getByRole('table', { name: 'Envíos de la empresa' })

    await page.getByRole('tab', { name: /^Entregados/ }).click()

    await expectEveryRowToShow(shipments, 'Entregado')
  })

  test('pages through the shipments', async ({ page }) => {
    const shipments = page.getByRole('table', { name: 'Envíos de la empresa' })
    const summary = page.getByText(/^Mostrando \d+ a \d+ de [\d.]+ envíos$/)

    await expect(summary).toHaveText(/^Mostrando 1 a 20 de [\d.]+ envíos$/)
    const firstShipment = await bodyRows(shipments).first().textContent()

    await page.getByRole('button', { name: 'Página siguiente' }).click()

    await expect(summary).toHaveText(/^Mostrando 21 a \d+ de [\d.]+ envíos$/)
    await expect(bodyRows(shipments).first()).not.toHaveText(firstShipment ?? '')
  })

  test('finds a shipment by its order number and opens the order', async ({ page }) => {
    const shipments = page.getByRole('table', { name: 'Envíos de la empresa' })
    // La segunda columna dice «Orden #71»: el número con el que se busca.
    const orderCell = bodyRows(shipments).first().getByRole('cell').nth(1)
    const orderLabel = (await orderCell.innerText()).match(/Orden (#\S+)/)?.[1]
    expect(orderLabel).toBeDefined()

    await page.getByRole('textbox', { name: 'Buscar' }).fill(orderLabel ?? '')

    await expect(bodyRows(shipments).first()).toContainText(`Orden ${orderLabel}`)
    await bodyRows(shipments)
      .first()
      .getByRole('button', { name: /^Ver la orden del envío/ })
      .click()
    await expect(page.getByRole('heading', { name: `Orden ${orderLabel}` })).toBeVisible()
  })
})
