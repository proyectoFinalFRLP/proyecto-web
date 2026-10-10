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
    /** Todavía no existe esa pantalla (TESIS-147): sin ella, la fila no enlaza. */
    failedEvents?: string
  }
}
