import { expect, test, type Page } from '@playwright/test'

/** Fondo de la página: es lo primero que cambia entre un tema y otro. */
function pageBackground(page: Page) {
  return page.evaluate(() => getComputedStyle(document.body).backgroundColor)
}

test.describe('theme', () => {
  test('switches between dark and light and remembers the choice', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(error.message))

    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'Panel de operación' })).toBeVisible()
    const toggle = page.getByRole('button', { name: 'Alternar tema' })

    // Dark es el tema por defecto del design system (ADR-007).
    const dark = await pageBackground(page)

    await toggle.click()
    await expect.poll(() => pageBackground(page)).not.toBe(dark)
    const light = await pageBackground(page)

    // La elección sobrevive a la recarga.
    await page.reload()
    await expect(page.getByRole('heading', { name: 'Panel de operación' })).toBeVisible()
    expect(await pageBackground(page)).toBe(light)

    // Y se puede volver al oscuro.
    await toggle.click()
    await expect.poll(() => pageBackground(page)).toBe(dark)

    expect(errors).toEqual([])
  })

  test.describe('visual', () => {
    // El login no depende de datos que cambian entre corridas (el panel sí), así
    // que es la pantalla que se compara píxel a píxel en los dos temas.
    test.use({ storageState: { cookies: [], origins: [] } })

    for (const mode of ['dark', 'light'] as const) {
      test(`renders the login in ${mode} mode without visual regressions`, async ({ page }) => {
        await page.addInitScript((themeChoice) => {
          localStorage.setItem('ui-store', JSON.stringify({ state: { themeChoice }, version: 0 }))
        }, mode)
        await page.goto('/login')
        await expect(page.getByRole('button', { name: 'Ingresar' })).toBeVisible()
        await page.evaluate(() => document.fonts.ready)

        await expect(page).toHaveScreenshot(`login-${mode}.png`, {
          maxDiffPixelRatio: 0.01,
          // El pie lleva el año en curso: se tapa para que la captura no venza en enero.
          mask: [page.getByText(/^© \d{4} OneStock/)],
        })
      })
    }
  })
})
