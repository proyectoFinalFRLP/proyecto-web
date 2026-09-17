# ADR-002: State Management

**Fecha:** 2026-04-03  
**Estado:** Aceptado

---

## Contexto

La aplicación necesita un mecanismo para gestionar estado global: preferencias de UI (tema claro/oscuro, sidebar abierto/cerrado), datos del usuario autenticado y cualquier estado compartido entre features. Se debe elegir una solución que sea simple, performante y compatible con React 19.

## Decisión

Se adopta **Zustand v5** como solución de estado global.

Los stores se organizan en `src/shared/store/`, un archivo por dominio de estado (e.g., `uiStore.ts`, `authStore.ts`).

## Alternativas consideradas

### Redux Toolkit

- ✅ Estándar de la industria, ampliamente conocido
- ✅ DevTools potentes
- ❌ Boilerplate significativo incluso con RTK
- ❌ Curva de aprendizaje más pronunciada
- ❌ Excesivo para el alcance del proyecto

### Context API (nativa de React)

- ✅ Sin dependencias externas
- ❌ Re-renders innecesarios sin optimizaciones manuales
- ❌ No escala bien para múltiples dominios de estado
- ❌ Requiere mucho código repetitivo

### Jotai / Recoil

- ✅ Modelo atómico elegante
- ❌ Menor adopción que Zustand
- ❌ El modelo mental es menos intuitivo para el equipo

## Consecuencias

- ✅ API mínima: los stores son funciones simples con `set`/`get`
- ✅ No requiere providers (a diferencia de Context o Redux)
- ✅ Compatible con React DevTools y con persistencia en `localStorage`
- ✅ Fácil de testear y de extender
- ⚠️ El estado del servidor (datos de la API) **no** se gestiona con Zustand — se usa React Query para eso (ver ADR-003)

### La identidad de la sesión, única excepción

`authStore.user` guarda lo que contesta `GET /me`: un dato del servidor dentro de
un store de Zustand. La excepción es deliberada y está acotada.

La respuesta la gobierna React Query igual que cualquier otra: el hook
`shared/hooks/useSessionIdentity` es el único que la pide, y el store recibe una
copia. No hay un segundo camino que escriba ahí ni una escritura que no venga de
esa lectura.

El motivo es que quien necesita la identidad no siempre está en el árbol de
React —el interceptor del cliente HTTP, el guard de ruta— y los que sí están la
leen en cada pantalla. Pasarla por la cache de React Query desde cada consumidor
obligaría a repetir el `useQuery` en todos, o a exponer el `queryClient` fuera de
React; el store ya es el lugar donde vive lo demás de la sesión (el token).

La regla entonces se lee así: **el estado del servidor no se gestiona con
Zustand.** Se puede espejar ahí cuando una sola lectura de React Query es su
origen y el store es sólo el punto desde donde el resto lo consume. Por eso la
identidad tampoco se persiste —sólo el token—: una copia vieja en `localStorage`
no puede contradecir lo que la API dice hoy.
