// Factory de query keys de la feature — nunca literales sueltos en los hooks.

export const warehouseKeys = {
  all: ['warehouses'] as const,
  list: () => [...warehouseKeys.all, 'list'] as const,
  /** El vocabulario de provincias. No cambia durante la sesión. */
  provinces: () => [...warehouseKeys.all, 'provinces'] as const,
}
