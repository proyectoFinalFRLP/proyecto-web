// Resolución del tenant activo — §5 del contrato BE↔FE (plan-demo/CONTRATO-tenant.md).
//
// El slug no es un dato de sesión: sale del host donde la app está servida (o de
// un override de desarrollo) y no cambia mientras la página vive. Por eso se
// resuelve una vez y se cachea a nivel de módulo: el interceptor HTTP lo
// necesita antes de que exista árbol de React.
//
// Es sólo transporte, nunca aislamiento: en cualquier endpoint con JWT el
// backend ignora el header y usa el `company_id` del token (§1 del contrato).

/** Header con el que el slug viaja al backend. */
export const TENANT_HEADER = 'X-Tenant-Slug'

/**
 * Endpoint público de config de tenant.
 *
 * Vive acá, y no suelto en cada archivo, porque dos lugares tienen que estar de
 * acuerdo sobre cuál es: el que lo pide y el interceptor que decide no firmarlo
 * con el JWT. Si se desincronizan, el síntoma es una marca equivocada en
 * pantalla y no un error.
 */
export const TENANT_CONFIG_PATH = '/tenant-config'

/** Tenant que se asume en local cuando no hay override. */
export const DEFAULT_TENANT_SLUG = 'norte'

/** Query param del override de desarrollo: `?tenant=sur`. */
const TENANT_QUERY_PARAM = 'tenant'

// Un slug es la primera etiqueta del host, así que su forma válida es la de una
// etiqueta de DNS. El override también se valida: llega de la URL, y mandar
// basura en el header sólo produciría un 404 más confuso.
const SLUG_PATTERN = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/

// Hosts sin subdominio propio donde corre el desarrollo.
const LOCAL_HOSTNAMES = new Set(['localhost', '127.0.0.1', '::1', '[::1]'])

// `www` nombra al sitio, no a un tenant: tomarla como slug haría que
// `www.<dominio>` pidiera la config de una empresa llamada "www".
const RESERVED_LABELS = new Set(['www'])

const IPV4 = /^\d{1,3}(?:\.\d{1,3}){3}$/

/** La parte de `window.location` de la que sale el slug. */
export interface TenantLocation {
  hostname: string
  search: string
}

function isValidSlug(value: string): boolean {
  return SLUG_PATTERN.test(value)
}

function normalize(value: string): string | null {
  const slug = value.trim().toLowerCase()
  return isValidSlug(slug) ? slug : null
}

function isLocalHostname(hostname: string): boolean {
  return LOCAL_HOSTNAMES.has(hostname)
}

// En producción el slug es el subdominio. `norte.localhost` alcanza con dos
// etiquetas —es el camino real de subdominio en desarrollo—; un dominio de
// verdad necesita tres (`norte.ejemplo.com`), porque `ejemplo.com` pelado no
// nombra a ningún tenant.
function slugFromHostname(hostname: string): string | null {
  if (IPV4.test(hostname)) return null

  const labels = hostname.split('.')
  const minimumLabels = labels[labels.length - 1] === 'localhost' ? 2 : 3
  if (labels.length < minimumLabels) return null

  const [candidate] = labels
  if (RESERVED_LABELS.has(candidate)) return null

  return normalize(candidate)
}

function slugFromQuery(search: string): string | null {
  const value = new URLSearchParams(search).get(TENANT_QUERY_PARAM)
  return value ? normalize(value) : null
}

// `unknown` y no el tipo declarado por Vite: el valor sale del entorno, así que
// la comprobación en runtime es la que manda.
function slugFromEnv(): string | null {
  const value: unknown = import.meta.env.VITE_TENANT
  return typeof value === 'string' ? normalize(value) : null
}

/**
 * Slug del tenant para el que se está sirviendo la app, o `null` si el host no
 * lo dice y no hay override — el caso "tenant desconocido".
 *
 * El orden del override de desarrollo es el del §5 del contrato:
 * `?tenant=` > `VITE_TENANT` > `norte`. Sólo aplica en hosts locales: en
 * producción el subdominio es la única fuente, para que una URL no pueda pedir
 * la identidad de otra empresa.
 */
export function resolveTenantSlug(location: TenantLocation = window.location): string | null {
  const hostname = location.hostname.toLowerCase()

  const fromHostname = slugFromHostname(hostname)
  if (fromHostname) return fromHostname

  if (!isLocalHostname(hostname)) return null

  return slugFromQuery(location.search) ?? slugFromEnv() ?? DEFAULT_TENANT_SLUG
}

// `undefined` = todavía no se resolvió; `null` = se resolvió y no hay tenant.
let cachedSlug: string | null | undefined

/** Slug resuelto una sola vez por carga de página. */
export function currentTenantSlug(): string | null {
  if (cachedSlug === undefined) {
    cachedSlug = resolveTenantSlug()
  }
  return cachedSlug
}
