import { expect, test as setup } from '@playwright/test'

import { logIn } from './support/auth'
import { ADMIN_STORAGE_STATE, NORTE_ADMIN } from './support/seeds'

setup('log in as the Norte admin', async ({ page }) => {
  await logIn(page, NORTE_ADMIN)
  await expect(page.getByRole('heading', { name: 'Panel de operación' })).toBeVisible()

  await page.context().storageState({ path: ADMIN_STORAGE_STATE })
})
