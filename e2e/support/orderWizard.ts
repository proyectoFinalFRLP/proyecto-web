import { expect, type Page } from '@playwright/test'

import { NORTE_PRODUCT, NORTE_WAREHOUSE } from './seeds'

interface Customer {
  firstName: string
  lastName: string
}

/** Paso 1 del alta manual: cliente y un producto, y avanza al paso 2. */
export async function fillCustomerAndProducts(page: Page, customer: Customer) {
  await page.goto('/orders')
  await page.getByRole('button', { name: 'Crear orden' }).click()
  await expect(page.getByText('Paso 1 de 3')).toBeVisible()

  await page.getByRole('textbox', { name: 'Nombre', exact: true }).fill(customer.firstName)
  await page.getByRole('textbox', { name: 'Apellido' }).fill(customer.lastName)
  await page.getByRole('textbox', { name: 'DNI / CUIT' }).fill('20-31298744-9')

  await page.getByRole('combobox', { name: 'Buscar por SKU o nombre' }).fill(NORTE_PRODUCT.sku)
  await page.getByRole('option', { name: new RegExp(NORTE_PRODUCT.sku) }).click()
  await page.getByRole('spinbutton', { name: 'Cantidad' }).fill('2')
  await page.getByRole('spinbutton', { name: 'Precio unitario' }).fill('1500')
  await page.getByRole('button', { name: 'Agregar SKU' }).click()

  const items = page.getByRole('table', { name: 'Productos de la orden' })
  await expect(items).toContainText(NORTE_PRODUCT.name)
  // 2 × $ 1.500
  await expect(page.getByRole('main')).toContainText('$ 3.000,00')

  await page.getByRole('button', { name: 'Siguiente: destino y origen' }).click()
  await expect(page.getByText('Paso 2 de 3')).toBeVisible()

  await page.getByRole('radio', { name: new RegExp(`^${NORTE_WAREHOUSE}`) }).check()
}
