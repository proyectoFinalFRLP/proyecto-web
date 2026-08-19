import HomeIcon from '@mui/icons-material/Home'
import Inventory2Icon from '@mui/icons-material/Inventory2'
import { lazy } from 'react'
import type { ReactNode } from 'react'

// Páginas cargadas de forma diferida (code-splitting por ruta).
const HomePage = lazy(() => import('features/home').then((m) => ({ default: m.HomePage })))
const DesignSystemPage = lazy(() =>
  import('features/design-system').then((m) => ({ default: m.DesignSystemPage })),
)
const InventoryPage = lazy(() =>
  import('features/inventory').then((m) => ({ default: m.InventoryPage })),
)
const LoginPage = lazy(() => import('features/auth').then((m) => ({ default: m.LoginPage })))

export interface NavMeta {
  label: string
  icon: ReactNode
}

export interface AppRoute {
  path: string
  element: ReactNode
  /** Si se define, la ruta se lista en el Sidebar con este label + ícono. */
  nav?: NavMeta
  /**
   * `'app'` (default): ruta privada, dentro de `AppLayout` (TopNavBar + Sidebar
   * + Outlet) y detrás del guard de sesión. `'bare'`: full-bleed y pública — el
   * login, que no puede exigir sesión ni renderizar el shell del dashboard.
   * Ver docs/guidelines/architecture.md §4.1.
   */
  layout?: 'app' | 'bare'
}

// Fuente única de verdad de las rutas de la app. El Router (AppRouter) y la
// navegación (Sidebar) se derivan de acá: sumar una feature es agregar una sola
// entrada a este array.
export const appRoutes: AppRoute[] = [
  {
    path: '/login',
    element: <LoginPage />,
    // Sin `nav`: no pertenece al Sidebar, que sólo existe dentro de la sesión.
    layout: 'bare',
  },
  {
    path: '/',
    element: <HomePage />,
    nav: { label: 'Inicio', icon: <HomeIcon /> },
  },
  {
    path: '/inventory',
    element: <InventoryPage />,
    nav: { label: 'Inventario', icon: <Inventory2Icon /> },
  },
  {
    path: '/design-system',
    element: <DesignSystemPage />,
    // Sin `nav`: accesible por URL/enlace, pero no listada en el Sidebar.
  },
]

// Rutas que se muestran en el Sidebar, ya angostadas (nav garantizado) para el render.
export const navRoutes = appRoutes.filter((route): route is AppRoute & { nav: NavMeta } =>
  Boolean(route.nav),
)

// Partición por layout — AppRouter monta `shellRoutes` detrás del guard y dentro
// de `AppLayout`, y `bareRoutes` sueltas, públicas y sin shell.
export const shellRoutes = appRoutes.filter((route) => route.layout !== 'bare')
export const bareRoutes = appRoutes.filter((route) => route.layout === 'bare')
