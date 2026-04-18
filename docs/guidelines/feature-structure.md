# Arquitectura Orientada a Features (Slices)

Esta guía define cómo trabajar con la estructura basada en dominios de negocio en lugar de tipos técnicos. El objetivo es maximizar el aislamiento, facilitar la escalabilidad y reducir el impacto de los cambios.

## 1. Concepto Fundamental
A diferencia de las arquitecturas tradicionales donde agrupamos por "qué es" el archivo (ej. `components/`, `hooks/`), aquí agrupamos por "qué hace" para el negocio (ej. `features/auth`, `features/pacientes`). Cada feature es una mini-aplicación autocontenida.

## 2. ¿Cuándo crear una Feature?
Se crea una feature nueva cuando se identifica un **módulo de negocio independiente** con su propia lógica, estados y componentes.
- **Ejemplos correctos:** `usuarios`, `reportes`, `facturacion`, `inventario`.
- **Ejemplos incorrectos:** `botones`, `inputs`, `modales` (estos pertenecen a `shared/components`).

## 3. Estructura Interna de una Feature
Cada carpeta en `src/features/[nombre]/` debe seguir estrictamente este orden:

| Carpeta/Archivo | Propósito |
| :--- | :--- |
| `components/` | UI específica y exclusiva de esta feature. |
| `hooks/` | Lógica de negocio, fetching (React Query) y estado local. |
| `pages/` | Componentes raíz que se mapean a las rutas de la app. |
| `types.ts` | Interfaces y tipos exclusivos de este dominio. |
| `index.ts` | **Public API (Barrel):** Solo exporta lo que otras capas necesitan ver. |

## 4. Reglas de Comunicación y Dependencias

### 4.1. Prohibición de Importaciones entre Features
- **Regla:** `features/feature-A` **NUNCA** debe importar nada de `features/feature-B`.
- **Razón:** Evita el acoplamiento circular y facilita la eliminación o refactorización de módulos enteros.
- **Solución:** Si ambas necesitan la misma lógica, esa lógica debe vivir en `shared/`.

### 4.2. Flujo de Dependencias (Jerarquía)
1. `features` → `shared` (Permitido: para utilidades, UI genérica y clientes API).
2. `features` → `app` (Prohibido: rompe la jerarquía).
3. `app` → `features` (Permitido: solo para registro de rutas en el Router).

## 5. El "Public API" (index.ts)
Cada feature debe tener un archivo `index.ts` que actúe como frontera.

```ts
// ✅ Correcto: Exportación controlada
export { PacienteList } from './components/PacienteList'
export { usePacientes } from './hooks/usePacientes'
export type { Paciente } from './types'

// ❌ Incorrecto: Exportar archivos internos directamente en otros módulos
import { X } from 'features/pacientes/components/Interno' // PROHIBIDO
```

## 6. Migración a shared/ (La Regla de Dos)
Para mantener la limpieza de la arquitectura, aplica la "Regla de Dos":

Si un componente o hook se usa en una sola feature, se queda dentro de esa feature.

En el momento en que una segunda feature necesite ese mismo elemento, se debe mover inmediatamente a src/shared/.

## 7. Manejo de Vistas y Rutas
Las páginas reales (vistas) viven en `features/[nombre]/pages/`.

El componente `PageWrapper` de `shared/` debe envolver siempre estas páginas para mantener la consistencia visual de márgenes y ancho máximo.

## 8. Gestión de Fixes y Refactor
Los errores de lógica de negocio deben resolverse dentro del `hook/` de la feature.

Los errores de UI consistentes en toda la app deben resolverse en `shared/components/`.

Si un fix requiere cambiar una estructura de datos compartida, se debe actualizar primero `shared/api/types.ts` y luego propagar a las features.