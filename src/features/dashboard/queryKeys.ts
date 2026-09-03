// Factory de query keys de la feature. Centraliza las keys de React Query en un
// solo lugar (nunca literales sueltos en los hooks) para que las invalidaciones
// sean consistentes. Patrón por feature (ver architecture.md §4.3).

export const integrationKeys = {
  all: ['integrations'] as const,
  lists: () => [...integrationKeys.all, 'list'] as const,
}
