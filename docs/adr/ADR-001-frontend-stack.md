# ADR-001: Frontend Stack

**Fecha:** 2026-04-03  
**Estado:** Aceptado

---

## Contexto

Este proyecto es el frontend de una aplicación web para el trabajo final de la carrera de Ingeniería en Sistemas de Información. El backend es una API REST construida con Ruby on Rails. Se necesita un stack frontend moderno, con tipado estático, buen ecosistema y soporte a largo plazo.

## Decisión

Se adopta el siguiente stack base:

| Tecnología | Versión | Rol |
|------------|---------|-----|
| **React** | 19 | Biblioteca de UI |
| **TypeScript** | 5.9 | Tipado estático |
| **Vite** | 8 | Bundler y dev server |

## Alternativas consideradas

### Vue 3
- ✅ Curva de aprendizaje más suave
- ❌ Menor adopción en el mercado laboral local
- ❌ Menor cantidad de recursos y ejemplos disponibles

### Next.js
- ✅ SSR/SSG out of the box
- ❌ Complejidad innecesaria para una SPA que consume API externa
- ❌ Overhead de framework opinionado para un proyecto académico

### Angular
- ✅ Framework completo y opinado (menos decisiones)
- ❌ Curva de aprendizaje alta
- ❌ Verbosidad excesiva para el alcance del proyecto

## Consecuencias

- ✅ React es el framework con mayor adopción, documentación y recursos
- ✅ TypeScript previene errores en tiempo de compilación y mejora el autocompletado
- ✅ Vite ofrece HMR instantáneo y builds rápidos
- ✅ El equipo tiene mayor familiaridad con el stack elegido
- ⚠️ React por sí solo no incluye routing, estado ni data fetching — se requieren librerías adicionales (ver ADR-002, ADR-003, ADR-004)
