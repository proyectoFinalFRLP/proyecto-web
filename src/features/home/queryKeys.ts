// Factory de query keys de la feature. Centraliza las keys de React Query en un
// solo lugar (nunca literales sueltos en los hooks) para que las invalidaciones
// sean consistentes: `queryClient.invalidateQueries({ queryKey: userKeys.all })`
// alcanza a listas y detalles. Patrón por feature (ver architecture.md §4.3).
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  detail: (id: number) => [...userKeys.all, 'detail', id] as const,
}
