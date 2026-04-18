# ADR-004: UI Library

**Fecha:** 2026-04-03  
**Estado:** Aceptado

---

## Contexto

Se necesita una biblioteca de componentes UI que provea un sistema de diseño consistente, accesible y productivo. El equipo no cuenta con un diseño gráfico definido desde el inicio, por lo que se necesita una base visual sólida que pueda personalizarse.

## Decisión

Se adopta **Material UI (MUI) v7** con **Emotion** como motor de estilos CSS-in-JS.

La configuración del tema (paleta, tipografía, breakpoints, overrides de componentes) se centraliza en `src/app/theme/theme.ts`.

## Alternativas consideradas

### Tailwind CSS + Headless UI

- ✅ Máxima flexibilidad de diseño, sin opiniones visuales
- ✅ Clases utilitarias producen bundles pequeños
- ❌ Requiere diseñar cada componente desde cero
- ❌ Curva de aprendizaje para mantener consistencia sin design tokens

### Ant Design

- ✅ Set de componentes muy completo
- ❌ Estilo difícil de personalizar sin conflictos
- ❌ Bundle size mayor
- ❌ Orientado a aplicaciones enterprise asiáticas (patrones no siempre adecuados)

### Chakra UI

- ✅ API amigable, buena accesibilidad
- ❌ Menor adopción y comunidad que MUI
- ❌ Personalización más limitada para temas complejos

### shadcn/ui

- ✅ Componentes copiables y totalmente controlables
- ❌ Requiere Tailwind (ver contras arriba)
- ❌ Más tiempo de setup inicial

## Consecuencias

- ✅ MUI provee más de 50 componentes accesibles y listos para usar
- ✅ El sistema de theming (paleta, tipografía, spacing) permite personalización profunda
- ✅ Soporte nativo para modo claro/oscuro
- ✅ Gran documentación y comunidad
- ⚠️ El bundle size es mayor que soluciones basadas en Tailwind — se mitiga con tree-shaking
- ⚠️ El CSS-in-JS con Emotion agrega overhead mínimo en runtime — aceptable para el alcance del proyecto
