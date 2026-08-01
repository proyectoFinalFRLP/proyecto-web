import HomeIcon from '@mui/icons-material/Home'
import { lazy } from 'react'
import type { ReactNode } from 'react'

// Páginas cargadas de forma diferida (code-splitting por ruta).
const HomePage = lazy(() => import('features/home').then((m) => ({ default: m.HomePage })))
const DesignSystemPage = lazy(() =>
  import('features/design-system').then((m) => ({ default: m.DesignSystemPage })),
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
}

// Rutas accesibles sin sesión: se renderizan fuera del layout privado y sin
// pasar por el guard (si pasaran, redirigir al login sería un bucle).
export const publicRoutes: AppRoute[] = [
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/design-system',
    // Showcase del design system: público a propósito, para poder trabajarlo
    // sin levantar el backend ni tener una sesión.
    element: <DesignSystemPage />,
  },
]

// Rutas privadas: exigen sesión válida y viven dentro del AppLayout. Sumar una
// feature al dashboard es agregar una sola entrada a este array.
export const appRoutes: AppRoute[] = [
  {
    path: '/',
    element: <HomePage />,
    nav: { label: 'Inicio', icon: <HomeIcon /> },
  },
]

// Rutas que se muestran en el Sidebar, ya angostadas (nav garantizado) para el render.
export const navRoutes = appRoutes.filter((route): route is AppRoute & { nav: NavMeta } =>
  Boolean(route.nav),
)
