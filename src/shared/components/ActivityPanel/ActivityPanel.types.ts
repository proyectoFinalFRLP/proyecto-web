export interface ActivityPanelProps {
  /** El botón que lo abrió. `null` lo mantiene cerrado. */
  anchorEl: HTMLElement | null
  onClose: () => void
  /**
   * A dónde lleva cada fila. Llegan por props y no se importan del router:
   * `shared/` no puede depender de `app/` (architecture.md §3.2).
   */
  paths: {
    order: (id: number) => string
    /**
     * La cola de reintentos. Con ella, la fila de un evento caído enlaza y el
     * pie del panel muestra un acceso fijo; sin ella, ninguna de las dos cosas.
     */
    failedEvents?: string
  }
}
