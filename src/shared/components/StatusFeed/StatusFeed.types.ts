export interface StatusFeedEntry {
  id: string | number
  /** Qué pasó, en una línea: "Sincronización de inventario completada." */
  title: string
  /** Contexto del evento: tiempo relativo y origen. Va en monoespaciada. */
  meta?: string
  /**
   * Marca la entrada como vigente: barra en acento y sin atenuar. El resto se
   * atenúa, así el ojo encuentra lo último que pasó sin leer los timestamps.
   * Lo decide quien consume el feed, no la posición en el array.
   */
  current?: boolean
}

export interface StatusFeedProps {
  /** Rótulo de la sección, en mayúsculas atenuadas. */
  label?: string
  entries: StatusFeedEntry[]
  /** Texto a mostrar cuando no hay eventos. Sin esto no se renderiza nada. */
  emptyMessage?: string
}
