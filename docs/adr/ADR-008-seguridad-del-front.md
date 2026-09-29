# ADR-008: Seguridad del front: datos como texto, headers de nginx y dependencias

**Fecha:** 2026-09-29  
**Estado:** Aceptado

---

## Contexto

El token de sesión vive en `localStorage` (ver [ADR-002](./ADR-002-state-management.md)): cualquier script que corra en el origen del front lo puede leer, así que un XSS equivale a robar la sesión. Los datos que el front muestra no los escribe sólo el usuario. Llegan también de los webhooks de los canales de venta (el cliente de una orden) y de los couriers (los eventos de tracking), y esos endpoints de la API no se autentican: cualquiera que conozca la URL puede mandar texto que termine en pantalla.

La QA de TESIS-130 encontró que el front ya mostraba todo como texto, pero sin nada que lo sostuviera si eso cambiaba: nginx no mandaba ningún header de seguridad, ninguna regla impedía agregar un `dangerouslySetInnerHTML`, y `npm audit` reportaba 11 vulnerabilidades altas que la CI no miraba. La contraparte de la API (CORS, HTTPS, secretos, seeds) está en el ADR-018 de proyecto-api.

## Decisión

### Los datos se muestran como texto

React escapa todo lo que renderiza como texto. Se verificó cargando HTML con un handler de script (una imagen rota con `onerror`) en el nombre y la dirección de un depósito, el nombre y la descripción de un producto, el nombre y la dirección del cliente de una orden manual y de una entrante por webhook, y el estado de un evento de tracking entrante. En listados, detalles, formularios, el autocompletado del alta y la bitácora del envío el HTML se ve como texto y no se ejecuta.

ESLint prohíbe las salidas que insertan HTML sin escapar:

- `react/no-danger`: `dangerouslySetInnerHTML`.
- `react/jsx-no-script-url`: los `href` con el esquema `javascript:`.
- `no-restricted-properties`: `innerHTML`, `outerHTML` e `insertAdjacentHTML`.

Si alguna vez hace falta renderizar HTML que viene de afuera, eso es una decisión nueva: pasa por un sanitizador y por un ADR, no por un `eslint-disable`.

### Headers de nginx

Los define `docker/security-headers.conf`, que se incluye en cada `location` de `docker/nginx.conf`. No va una sola vez en `server` porque nginx no hereda los `add_header` del nivel de arriba en un location que declara los suyos, y `/assets/` e `/index.html` declaran `Cache-Control`. Todos llevan `always`, así salen también en las respuestas de error.

| Header                      | Valor                             |
| --------------------------- | --------------------------------- |
| `Content-Security-Policy`   | ver abajo                         |
| `X-Frame-Options`           | `DENY`                            |
| `X-Content-Type-Options`    | `nosniff`                         |
| `Referrer-Policy`           | `strict-origin-when-cross-origin` |
| `Strict-Transport-Security` | `max-age=31536000`                |

La CSP:

```
default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';
img-src 'self' data:; font-src 'self' data:; connect-src 'self' <origen de la API>;
object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'
```

- **`script-src 'self'`** es la línea que importa: aunque un HTML llegara al DOM, sus handlers y scripts inline no corren. El bundle de Vite no tiene scripts inline, así que no hace falta ni hash ni nonce.
- **`style-src 'unsafe-inline'`**: Emotion, el motor de estilos de MUI, inserta `<style>` en runtime. Un estilo inyectado no ejecuta código, así que el costo es bajo.
- **`img-src` y `font-src`** admiten `data:` porque Vite embebe como data URI los assets chicos. Las fuentes vienen empaquetadas (`@fontsource-variable`), no de un CDN.
- **`connect-src`**: el Dockerfile reemplaza `__API_ORIGIN__` con el origen (esquema, host y puerto) de `VITE_API_URL`, el mismo argumento de build que usa el bundle. Así la política y el bundle no se pueden desencontrar. Con una URL relativa queda sólo `'self'`.
- **HSTS**: el TLS termina en el proxy de adelante (Caddy), pero el header llega igual al navegador. Por HTTP plano, como con el contenedor en local, el navegador lo ignora.
- `RUN nginx -t` en el Dockerfile: una config rota corta el build y no el arranque del contenedor.

### Dependencias

`npm audit fix` resolvió las 11 vulnerabilidades altas sin salir de los rangos de `package.json` (entre otras, `react-router` 7.18, `axios` 1.20 y `vite` 8.3). La CI suma el job `security`, que corre `npm audit --audit-level=high` sobre el lockfile, de producción y de desarrollo, como el `bundler-audit` de la API.

## Alternativas consideradas

### CSP con nonce para los estilos

- ✅ Sacaría `'unsafe-inline'` de `style-src`
- ❌ El nonce se genera por respuesta, y nginx sirve un `index.html` estático: haría falta un paso que lo reescriba en cada request y pasarle el nonce a Emotion
- ❌ Protege contra la inyección de estilos, que no ejecuta código

### `connect-src 'self' https:`

- ✅ No depende de `VITE_API_URL`
- ❌ Deja que un script inyectado mande datos a cualquier servidor HTTPS

### Auditar sólo las dependencias de producción (`--omit=dev`)

- ✅ La CI no se cortaría por una vulnerabilidad de una herramienta de desarrollo
- ❌ El dev server de Vite y los plugins corren en las máquinas del equipo, con acceso al código y al `.env`

## Consecuencias

- ✅ Si un dato con HTML llegara al DOM, sus scripts igual no corren
- ✅ Nadie puede embeber el front en un iframe
- ✅ Una dependencia con una vulnerabilidad alta corta la CI
- ⚠️ Un recurso de otro origen (un logo del tenant por URL, un script de analytics) necesita sumarse a la CSP; si no, el navegador lo bloquea y lo avisa en la consola
- ⚠️ Una vulnerabilidad nueva en cualquier dependencia pone roja la CI de todos los PRs hasta que se resuelva
