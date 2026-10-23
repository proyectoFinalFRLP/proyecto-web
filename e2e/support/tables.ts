import { expect, type Locator } from '@playwright/test'

/** Las filas de datos de una tabla: todas menos la del encabezado. */
export function bodyRows(table: Locator): Locator {
  return table.locator('tbody').getByRole('row')
}

/** Espera a que la tabla tenga filas y comprueba que todas digan `text` (un filtro aplicado). */
export async function expectEveryRowToShow(table: Locator, text: string) {
  const rows = bodyRows(table)
  // Al cambiar de filtro la tabla se vacía y se vuelve a llenar: se espera a
  // que la primera fila ya sea del filtro nuevo antes de contarlas.
  await expect(rows.first()).toContainText(text)

  for (const row of await rows.all()) {
    await expect(row).toContainText(text)
  }
}
