import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined'
import Inventory2Icon from '@mui/icons-material/Inventory2'
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined'
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined'
import WarehouseOutlinedIcon from '@mui/icons-material/WarehouseOutlined'
import { lazy } from 'react'
import type { ReactNode } from 'react'

// Páginas cargadas de forma diferida (code-splitting por ruta).
const DashboardPage = lazy(() =>
  import('features/dashboard').then((m) => ({ default: m.DashboardPage })),
)
const DesignSystemPage = lazy(() =>
  import('features/design-system').then((m) => ({ default: m.DesignSystemPage })),
)
const OrdersPage = lazy(() => import('features/orders').then((m) => ({ default: m.OrdersPage })))
const NewOrderPage = lazy(() =>
  import('features/orders').then((m) => ({ default: m.NewOrderPage })),
)
const ShippingStepPage = lazy(() =>
  import('features/orders').then((m) => ({ default: m.ShippingStepPage })),
)
const CarrierStepPage = lazy(() =>
  import('features/orders').then((m) => ({ default: m.CarrierStepPage })),
)
const OrderEditPage = lazy(() =>
  import('features/orders').then((m) => ({ default: m.OrderEditPage })),
)
const OrderDetailPage = lazy(() =>
  import('features/orders').then((m) => ({ default: m.OrderDetailPage })),
)
const InventoryPage = lazy(() =>
  import('features/inventory').then((m) => ({ default: m.InventoryPage })),
)
const ProductDetailPage = lazy(() =>
  import('features/inventory').then((m) => ({ default: m.ProductDetailPage })),
)
const ShipmentsPage = lazy(() =>
  import('features/shipments').then((m) => ({ default: m.ShipmentsPage })),
)
const WarehousesPage = lazy(() =>
  import('features/warehouses').then((m) => ({ default: m.WarehousesPage })),
)
const FailedEventsPage = lazy(() =>
  import('features/failed-events').then((m) => ({ default: m.FailedEventsPage })),
)
const ReportsPage = lazy(() => import('features/reports').then((m) => ({ default: m.ReportsPage })))
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

/** Ruta ya angostada para el Sidebar: `nav` garantizado. */
export type NavRoute = AppRoute & { nav: NavMeta }

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
    // El panel es la pantalla de entrada: es lo primero que se ve al iniciar
    // sesión (LoginPage navega a `from ?? '/'`). Antes acá vivía una pantalla
    // de Inicio que no mostraba datos y anunciaba el panel como algo que
    // llegaba más adelante (TESIS-111); el panel existe desde TESIS-53.
    path: '/',
    element: <DashboardPage />,
    nav: { label: 'Dashboard', icon: <InsightsOutlinedIcon /> },
  },
  {
    path: '/orders',
    element: <OrdersPage />,
    nav: { label: 'Órdenes', icon: <ReceiptLongOutlinedIcon /> },
  },
  {
    path: '/orders/new',
    element: <NewOrderPage />,
    // Sin `nav`: se llega desde «Crear orden» del listado. Paso 1 del alta
    // manual; los pasos 2 y 3 (TESIS-58, TESIS-59) cuelgan de esta ruta.
  },
  {
    path: '/orders/new/shipping',
    element: <ShippingStepPage />,
    // Paso 2 del alta manual: origen y destino. Se llega desde el paso 1.
  },
  {
    path: '/orders/new/carrier',
    element: <CarrierStepPage />,
    // Paso 3 del alta manual: cotización y confirmación. Se llega desde el paso 2.
  },
  {
    path: '/orders/edit/:orderId',
    element: <OrderEditPage />,
    // Sin `nav`: se llega desde «Modificar orden» del detalle o «Editar» del listado.
  },
  {
    path: '/orders/:orderId',
    element: <OrderDetailPage />,
    // Sin `nav`: se llega desde el listado, no desde el Sidebar.
  },
  {
    path: '/shipments',
    element: <ShipmentsPage />,
    nav: { label: 'Envíos', icon: <LocalShippingOutlinedIcon /> },
  },
  {
    path: '/inventory',
    element: <InventoryPage />,
    nav: { label: 'Inventario', icon: <Inventory2Icon /> },
  },
  {
    path: '/inventory/:productId',
    element: <ProductDetailPage />,
    // Sin `nav`: se llega desde el catálogo, no desde el Sidebar.
  },
  {
    path: '/warehouses',
    element: <WarehousesPage />,
    nav: { label: 'Depósitos', icon: <WarehouseOutlinedIcon /> },
  },
  {
    path: '/failed-events',
    element: <FailedEventsPage />,
    nav: { label: 'Eventos fallidos', icon: <ErrorOutlineIcon /> },
  },
  {
    path: '/reports',
    element: <ReportsPage />,
    nav: { label: 'Reportes', icon: <BarChartOutlinedIcon /> },
  },
  {
    path: '/design-system',
    element: <DesignSystemPage />,
    // Sin `nav`: accesible por URL/enlace, pero no listada en el Sidebar.
  },
]

/**
 * Rutas que lista el Sidebar.
 *
 * Era `navRoutesFor(features)`, porque Integraciones se mostraba sólo a los
 * tenants con ese flag encendido. Esa sección se sacó en TESIS-140 —la
 * administra el equipo, no la empresa— y con ella la última ruta con flag, así
 * que hoy la navegación es la misma para todos y una función que recibiera la
 * config y no la mirara diría algo falso.
 *
 * El flag del tenant no desaparece: sigue decidiendo si el detalle de producto
 * muestra la tarjeta de canales de venta (`useTenantFeature('integrations')`).
 * La diferencia entre dos clientes sigue estando en su config y no en una rama
 * del código; lo que cambió es dónde se nota.
 */
export const navRoutes: NavRoute[] = appRoutes.filter((route): route is NavRoute =>
  Boolean(route.nav),
)

// Partición por layout — AppRouter monta `shellRoutes` detrás del guard y dentro
// de `AppLayout`, y `bareRoutes` sueltas, públicas y sin shell.
export const shellRoutes = appRoutes.filter((route) => route.layout !== 'bare')
export const bareRoutes = appRoutes.filter((route) => route.layout === 'bare')
