import { expect, test } from '@playwright/test'

import { logIn } from './support/auth'
import { NORTE_ADMIN, SUR_ADMIN } from './support/seeds'

// Estos tests prueban el login en sí: arrancan sin la sesión que guarda el setup.
test.use({ storageState: { cookies: [], origins: [] } })

test.describe('login and logout', () => {
  test('sends a visitor without a session to the login', async ({ page }) => {
    await page.goto('/orders')

    await expect(page).toHaveURL(/\/login$/)
    await expect(page.getByRole('button', { name: 'Ingresar' })).toBeVisible()
  })

  test('rejects a wrong password without opening a session', async ({ page }) => {
    await logIn(page, { ...NORTE_ADMIN, password: 'not-the-password' })

    await expect(page.getByRole('alert')).toHaveText('Email o contraseña incorrectos.')
    await expect(page).toHaveURL(/\/login$/)
  })

  test('logs in, lands on the dashboard and logs out', async ({ page }) => {
    await logIn(page, NORTE_ADMIN)

    await expect(page).toHaveURL(/\/$/)
    await expect(page.getByRole('heading', { name: 'Panel de operación' })).toBeVisible()
    await expect(page.getByRole('banner')).toContainText('Distribuidora Norte')

    await page.getByRole('button', { name: 'Cuenta de usuario' }).click()
    await page.getByRole('menuitem', { name: 'Cerrar sesión' }).click()

    await expect(page).toHaveURL(/\/login$/)
    // Sin sesión, las rutas privadas vuelven a pedir el login.
    await page.goto('/inventory')
    await expect(page).toHaveURL(/\/login$/)
  })
})

test.describe('tenant isolation', () => {
  test('does not let a Norte user in through the Sur portal', async ({ page }) => {
    await logIn(page, NORTE_ADMIN, '/login?tenant=sur')

    await expect(page.getByRole('alert')).toHaveText('Email o contraseña incorrectos.')
    await expect(page).toHaveURL(/\/login/)
  })

  test('shows a Sur user only the Sur catalog', async ({ page }) => {
    await logIn(page, SUR_ADMIN, '/login?tenant=sur')
    // Primero que haya entrado: el login también tiene un `banner` con el nombre
    // de la empresa, y sin esto el assert del header pasaría antes de ingresar.
    await expect(page).toHaveURL(/\/(\?tenant=sur)?$/)
    await expect(page.getByRole('heading', { name: 'Panel de operación' })).toBeVisible()
    await expect(page.getByRole('banner')).toContainText('Comercial Sur')

    // Por el Sidebar y no con `goto`: el slug de `?tenant=` vale para la carga
    // de la página, y una recarga sin él volvería al tenant por defecto.
    await page.getByRole('link', { name: 'Inventario', exact: true }).click()

    const catalog = page.getByRole('table', { name: 'Catálogo de productos' })
    await expect(catalog.getByRole('row').nth(1)).toBeVisible()
    await expect(catalog).not.toContainText('NOR-')
  })
})
