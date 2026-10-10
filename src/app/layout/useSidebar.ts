import { useMediaQuery } from '@mui/material'
import type { Theme } from '@mui/material/styles'
import { layout } from 'app/theme/tokens'
import { useUiStore } from 'shared/store'

/** Ancho de la sidebar, abierta: el del DS. */
export const SIDEBAR_WIDTH = layout.sidebarWidth

// Debajo de `lg` (1280px) la sidebar fija se come demasiado: a 800px, el
// proyector de la demo, dejaba 545px de contenido y las tablas escondían el
// estado, el importe y las acciones detrás del scroll horizontal. Ahí pasa a
// flotar sobre el contenido, que recupera todo el ancho.
const floatingQuery = (theme: Theme) => theme.breakpoints.down('lg')

export interface SidebarState {
  /** `true` debajo de `lg`: la sidebar flota sobre el contenido en vez de empujarlo. */
  floating: boolean
  open: boolean
  /** Lo que hace la hamburguesa: abre o cierra la sidebar del modo actual. */
  toggle: () => void
  /** Cierra la flotante (al elegir una sección o tocar afuera). La fija no se cierra sola. */
  close: () => void
}

/**
 * La sidebar según el ancho de la pantalla: fija y abierta en las anchas,
 * flotante y cerrada en las angostas.
 *
 * Header, Sidebar y AppLayout la leen de acá para no decidir el modo cada uno
 * por su lado: si uno pensara que flota y otro que no, el contenido quedaría
 * corrido detrás de un panel que no está.
 *
 * `noSsr` lee el `matchMedia` en el primer render. Sin eso el primer render
 * supone pantalla ancha y a 800px la sidebar fija aparece un instante, abierta,
 * antes de pasar a flotar.
 */
export function useSidebar(): SidebarState {
  const floating = useMediaQuery(floatingQuery, { noSsr: true })
  const dockedOpen = useUiStore((state) => state.sidebarOpen)
  const floatingOpen = useUiStore((state) => state.floatingSidebarOpen)
  const toggleDocked = useUiStore((state) => state.toggleSidebar)
  const setFloatingOpen = useUiStore((state) => state.setFloatingSidebarOpen)

  return {
    floating,
    open: floating ? floatingOpen : dockedOpen,
    toggle: floating ? () => setFloatingOpen(!floatingOpen) : toggleDocked,
    close: () => setFloatingOpen(false),
  }
}
