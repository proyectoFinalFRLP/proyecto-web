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
