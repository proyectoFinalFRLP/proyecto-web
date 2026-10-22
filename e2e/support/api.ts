import { request, type APIRequestContext } from '@playwright/test'

import { NORTE_ADMIN } from './seeds'

/** Misma API que usa el front que levanta `playwright.config.ts`. */
const API_URL = process.env.E2E_API_URL ?? 'http://localhost:3000/api/v1'

/** Un cliente de la API ya autenticado como el admin de Norte. */
export async function norteApi(): Promise<APIRequestContext> {
  const anonymous = await request.newContext({ extraHTTPHeaders: { 'X-Tenant-Slug': 'norte' } })
  const login = await anonymous.post(`${API_URL}/auth/login`, { data: NORTE_ADMIN })
  const { token } = (await login.json()) as { token: string }
  await anonymous.dispose()

  return request.newContext({
    extraHTTPHeaders: { 'X-Tenant-Slug': 'norte', Authorization: `Bearer ${token}` },
  })
}

/**
 * Deja al menos `minimum` productos en el catálogo de Norte, para que el
 * listado tenga más de una página. Los seeds traen 7 y la página es de 20.
 *
 * Los SKU son fijos (`E2E-PAG-01`, …): una corrida que ya los creó no crea
 * nada, así la base no crece en cada corrida. Van sin stock, para no mover las
 * métricas del panel.
 */
export async function ensureCatalogSize(minimum: number) {
  const api = await norteApi()
  const page = await api.get(`${API_URL}/products?per_page=1`)
  const { meta } = (await page.json()) as { meta: { total: number } }

  let missing = minimum - meta.total
  for (let index = 1; missing > 0 && index <= minimum; index += 1) {
    const sku = `E2E-PAG-${String(index).padStart(2, '0')}`
    // Un 409 es un SKU que ya existe (de una corrida anterior): se sigue con el próximo.
    const created = await api.post(`${API_URL}/products`, {
      data: {
        product: {
          sku,
          name: `Producto de paginación ${sku}`,
          description: null,
          category: null,
          weight: 1,
          length_cm: null,
          width_cm: null,
          height_cm: null,
          low_stock_threshold: 0,
          stocks: [],
        },
      },
    })
    if (created.ok()) missing -= 1
  }

  await api.dispose()
}
