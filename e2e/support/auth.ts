import type { Page } from '@playwright/test'

interface Credentials {
  email: string
  password: string
}

/** Completa y envía el login. `path` permite entrar por `/login?tenant=sur`. */
export async function logIn(page: Page, credentials: Credentials, path = '/login') {
  await page.goto(path)
  await page.getByLabel('Email').fill(credentials.email)
  await page.getByLabel('Contraseña').fill(credentials.password)
  await page.getByRole('button', { name: 'Ingresar' }).click()
}
