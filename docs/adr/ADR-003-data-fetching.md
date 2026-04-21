# ADR-003: Data Fetching

**Fecha:** 2026-04-03  
**Estado:** Aceptado

---

## Contexto

La aplicación consume una API REST de Ruby on Rails. Se necesita una estrategia para:

- Realizar peticiones HTTP
- Gestionar estados de carga/error/éxito
- Cachear respuestas para evitar refetches innecesarios
- Manejar paginación, refetch automático e invalidación de caché

## Decisión

Se adopta la combinación **TanStack React Query v5 + Axios v1** para todo el data fetching.

- **Axios** se usa como cliente HTTP (`src/shared/api/client.ts`): maneja la instancia base, headers, interceptors y normalización de errores.
- **React Query** se usa como capa de gestión de estado del servidor: cachea, sincroniza y actualiza datos remotos.

Regla: **nunca usar `useEffect` + `useState` para fetch de datos**. Siempre usar `useQuery` / `useMutation`.

## Alternativas consideradas

### fetch nativo + useEffect

- ✅ Sin dependencias externas
- ❌ Requiere implementar manualmente caché, loading states, error handling, refetch, etc.
- ❌ Propenso a race conditions y memory leaks

### SWR (Vercel)

- ✅ API simple, similar a React Query
- ❌ Menos features que React Query (sin mutations nativas, paginación más limitada)
- ❌ Menor adopción y comunidad

### RTK Query (Redux Toolkit)

- ✅ Integrado con Redux, DevTools potentes
- ❌ Requiere adoptar Redux (descartado en ADR-002)
- ❌ Más verboso y acoplado

## Consecuencias

- ✅ React Query elimina la necesidad de manejar loading/error states manualmente
- ✅ Caché automático reduce llamadas redundantes a la API
- ✅ Axios permite configurar interceptors una sola vez (token, errores) y reutilizarlos en toda la app
- ✅ El patrón de custom hooks (`useQuery` wrapeado en `useEntidad`) facilita la separación de concerns
- ⚠️ La configuración del `QueryClient` (staleTime, retry, etc.) debe revisarse según los requisitos de cada endpoint
