/**
 * Las opciones de un select de categoría: el vocabulario de la API, más el
 * valor actual si la lista no lo trae.
 *
 * Pasa en dos casos reales: la lista todavía no llegó (primer render), o la
 * categoría salió del vocabulario después de asignarse. En los dos, sin esto
 * el select se mostraría vacío mientras el dato sigue ahí —un filtro aplicado
 * que no se ve, o un guardado que borra la categoría sin que nadie lo pida—.
 */
export function categoryOptions(categories: readonly string[], current: string): string[] {
  return current !== '' && !categories.includes(current)
    ? [current, ...categories]
    : [...categories]
}
