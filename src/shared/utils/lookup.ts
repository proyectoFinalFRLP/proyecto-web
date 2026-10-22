/**
 * El valor de una clave en un mapa explícito, o `fallback` si el mapa no la
 * tiene.
 *
 * Los mapas de estado (`Record<ShipmentStatus, …>`) son exhaustivos para el
 * compilador, que marca el archivo cuando el tipo suma un estado. Pero el
 * estado llega de la API como un string: si el backend suma uno antes que el
 * front (los finales de OCA de TESIS-188), el índice da `undefined` y el badge
 * revienta o queda sin texto. Esto es la red para ese caso, sin aflojar el tipo
 * del mapa.
 *
 * `Object.hasOwn` y no `map[key] ?? fallback`: un estado que se llamara
 * `constructor` o `toString` encontraría el del prototipo. `NoInfer`: el tipo
 * sale del mapa, no del fallback (si no, `'neutral'` achicaba el del mapa).
 */
export function lookup<V>(map: Readonly<Record<string, V>>, key: string, fallback: NoInfer<V>): V {
  return Object.hasOwn(map, key) ? map[key] : fallback
}
