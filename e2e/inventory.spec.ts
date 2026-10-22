import { expect, test } from '@playwright/test'

import { ensureCatalogSize } from './support/api'
import { NORTE_PRODUCT, NORTE_WAREHOUSE, uniqueSuffix } from './support/seeds'
import { bodyRows, expectEveryRowToShow } from './support/tables'

/** Productos por página del catálogo (`PER_PAGE` de InventoryPage). */
const PAGE_SIZE = 20

test.describe('inventory', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/inventory')
    await expect(page.getByRole('heading', { name: 'Inventario', level: 1 })).toBeVisible()
  })

  test('searches the catalog by name', async ({ page }) => {
    const catalog = page.getByRole('table', { name: 'Catálogo de productos' })

    await page.getByRole('textbox', { name: 'Buscar productos' }).fill('Logitech')

    await expect(bodyRows(catalog)).toHaveCount(1)
    await expect(bodyRows(catalog).first()).toContainText(NORTE_PRODUCT.sku)
  })

  test('filters the catalog by stock status', async ({ page }) => {
    const catalog = page.getByRole('table', { name: 'Catálogo de productos' })

    await page.getByRole('tab', { name: /^Stock bajo/ }).click()

    await expect(page.getByRole('tab', { name: /^Stock bajo/ })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    await expect(page).toHaveURL(/tab=low/)
    await expectEveryRowToShow(catalog, 'Stock bajo')
  })

  test('pages through the catalog', async ({ page }) => {
    // El catálogo de los seeds entra en una página (7 productos, 20 por
    // página): se completa por la API hasta tener una segunda.
    await ensureCatalogSize(PAGE_SIZE + 1)
    await page.reload()

    const catalog = page.getByRole('table', { name: 'Catálogo de productos' })
    const summary = page.getByText(/^Mostrando \d+ a \d+ de \d+ productos$/)

    await expect(summary).toHaveText(/^Mostrando 1 a 20 de \d+ productos$/)
    await expect(bodyRows(catalog)).toHaveCount(PAGE_SIZE)
    const firstSku = await bodyRows(catalog).first().getByRole('cell').first().innerText()

    await page.getByRole('button', { name: 'Página siguiente' }).click()

    await expect(summary).toHaveText(/^Mostrando 21 a \d+ de \d+ productos$/)
    await expect(bodyRows(catalog).first()).not.toContainText(firstSku)
    await expect(page.getByRole('button', { name: 'Página anterior' })).toBeEnabled()

    await page.getByRole('button', { name: 'Página anterior' }).click()
    await expect(summary).toHaveText(/^Mostrando 1 a 20 de \d+ productos$/)
  })

  test('creates a product with initial stock', async ({ page }) => {
    const suffix = uniqueSuffix()
    const product = { sku: `E2E-${suffix}`, name: `Producto E2E ${suffix}` }

    await page.getByRole('button', { name: 'Nuevo producto' }).click()
    const dialog = page.getByRole('dialog', { name: 'Crear producto' })

    await dialog.getByRole('textbox', { name: 'Nombre del producto' }).fill(product.name)
    await dialog.getByRole('textbox', { name: 'Código SKU' }).fill(product.sku)
    await dialog.getByRole('spinbutton', { name: 'Peso (kg)' }).fill('1.5')
    await dialog.getByRole('spinbutton', { name: /^Stock mínimo/ }).fill('5')
    await dialog.getByRole('combobox', { name: 'Elegí un depósito' }).click()
    await page.getByRole('option', { name: NORTE_WAREHOUSE }).click()
    await dialog.getByRole('spinbutton', { name: 'Cantidad' }).fill('25')
    await dialog.getByRole('button', { name: 'Crear producto' }).click()

    await expect(dialog).toBeHidden()

    // Aparece en el catálogo con su stock, disponible.
    await page.getByRole('textbox', { name: 'Buscar productos' }).fill(product.sku)
    const catalog = page.getByRole('table', { name: 'Catálogo de productos' })
    await expect(bodyRows(catalog)).toHaveCount(1)
    const row = bodyRows(catalog).first()
    await expect(row).toContainText(product.name)
    await expect(row).toContainText('25')
    await expect(row).toContainText('Disponible')
    await expect(row).toContainText(NORTE_WAREHOUSE)

    // Y el detalle muestra las 25 unidades en el depósito elegido.
    await row.getByRole('button', { name: product.sku, exact: true }).click()
    await expect(page.getByRole('heading', { name: product.sku, level: 1 })).toBeVisible()
    await expect(page.getByRole('main')).toContainText(product.name)
    await expect(page.getByRole('main')).toContainText('Repartido en 1 depósito.')
    const warehouseRow = page.getByRole('row', { name: new RegExp(`^${NORTE_WAREHOUSE}`) })
    // Comprometido, en tránsito, en depósito y estado.
    await expect(warehouseRow.getByRole('cell')).toHaveText(['0', '0', '25', 'Disponible'])
  })
})
