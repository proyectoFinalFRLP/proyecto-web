# Guía para redactar Pull Requests

Este documento define cómo completar cada sección del template de PR. Está pensado para ser usado como contexto por una IA al redactar descripciones de pull requests.

El template vive en `.github/pull_request_template.md`.

---

## Principios generales

- **Escribir para el reviewer, no para el autor.** Quien revisa no tiene el contexto de lo que se estuvo trabajando. El PR debe ser autoexplicativo.
- **Explicar el por qué, no solo el qué.** El diff ya muestra qué cambió; el PR debe explicar la motivación y el razonamiento detrás de las decisiones.
- **Ser específico y concreto.** Evitar frases vagas como "se mejoró la UI" o "se refactorizó el código". Decir exactamente qué componente, qué comportamiento, qué caso.
- **Idioma:** español para toda la descripción. (Los commits van en inglés, las descripciones de PR en español.)

---

## Sección por sección

### 🔗 Link

Solo reemplazar `TESIS-XXX` con el número de la card. Sin texto adicional.

---

### 📝 Descripción

Responder en 2–4 oraciones:

1. **Qué hace este PR** — el comportamiento o funcionalidad que introduce o corrige.
2. **Por qué es necesario** — el problema que resuelve o el valor que aporta.
3. **Contexto relevante** (si aplica) — decisiones de diseño no obvias, limitaciones conocidas, dependencias con otros PRs o con el backend.

**No incluir:** lista de archivos modificados, explicación del código, ni información que ya está en el diff.

**Ejemplos:**

```
✅ Agrega el formulario de login con validación de email y contraseña mediante Zod.
   El backend ya expone el endpoint POST /auth/login; este PR conecta el flujo completo
   desde el formulario hasta el guardado del token en localStorage.

✅ Corrige el crash que ocurría al navegar a /usuarios sin estar autenticado.
   React Router no redirigía correctamente cuando el token estaba expirado; se agrega
   un guard en AppRouter que intercepta el 401 del cliente Axios.

❌ Se modificaron varios archivos para agregar funcionalidad de login.
❌ Refactor del componente LoginForm y actualización de dependencias.
```

---

### 🛠️ Cambios realizados

Lista de bullets. Cada item debe:

- **Mencionar el componente, hook, store o archivo afectado** — no solo la acción.
- **Describir el cambio en términos de comportamiento o estructura**, no de implementación interna.
- Usar verbos en pasado: "Agrega", "Extrae", "Corrige", "Renombra", "Reemplaza".

Agrupar primero los cambios principales y después los secundarios o colaterales.

**Ejemplos:**

```
✅
- Agrega `LoginPage` con formulario controlado por React Hook Form + Zod
- Agrega `useLogin` hook que encapsula la mutación POST /auth/login
- Agrega `authStore` en `shared/store/` para guardar token y datos del usuario autenticado
- Extiende el cliente Axios para limpiar el token en `localStorage` ante respuestas 401
- Registra la ruta `/login` en `AppRouter` con redirect a `/` si ya hay sesión activa

✅ (cambio pequeño)
- Corrige el cálculo de `totalPages` en `usePaginatedQuery` cuando `totalCount` es 0

❌ Se hicieron cambios en LoginPage, authStore, client.ts y AppRouter
❌ Refactor y mejoras varias en autenticación
```

Cuando el PR es un refactor sin cambio de comportamiento, aclararlo explícitamente:

```
✅
- Extrae la lógica de validación de `UserForm` a un hook `useUserForm` (sin cambio de comportamiento)
- Renombra `UsuarioCard` a `UserCard` para consistencia con el resto del codebase
```

---

### 🧪 Cómo probarlo (Opcional)

Completar cuando el PR introduce comportamiento que no es evidente solo leyendo el diff, o cuando hay casos límite importantes.

**Estructura:** un caso por flujo o escenario. Cada caso incluye:
- **Precondición** (si aplica): estado de la app, datos necesarios, usuario requerido.
- **Pasos numerados**: acciones concretas y reproducibles.
- **Resultado esperado**: qué debe verse o suceder al final.

```
✅ Ejemplo bien escrito:

### Caso 1: login exitoso
_Precondición: la API Rails está corriendo y existe un usuario registrado._
1. Navegar a `/login`
2. Ingresar email y contraseña válidos
3. Hacer clic en "Ingresar"
→ Redirige a `/` y el Header muestra el nombre del usuario

### Caso 2: credenciales inválidas
1. Navegar a `/login`
2. Ingresar una contraseña incorrecta
3. Hacer clic en "Ingresar"
→ Aparece un mensaje de error debajo del formulario; no hay redirección

### Caso 3: acceso directo sin sesión
1. Sin estar logueado, navegar directamente a `/usuarios`
→ Redirige automáticamente a `/login`
```

```
❌ Ejemplo pobre:

### Caso 1
1. Probar el login
2. Ver que funciona
```

Omitir la sección si el PR es puramente de refactor sin cambio de comportamiento, o si los cambios son triviales (ej: corrección tipográfica, ajuste de estilos).

---

### 📸 Evidencia (Opcional)

- Incluir para cualquier PR que modifique la UI visible.
- Usar la tabla Antes/Después arrastrando imágenes o pegando capturas.
- Si el cambio no tiene impacto visual, reemplazar la tabla por `N/A`.
- Si el cambio es solo en dark mode, agregar una fila extra para ese contexto.

---

## Casos especiales

### Bug fix

La descripción debe explicar:
1. Cuál era el comportamiento incorrecto (síntoma)
2. Cuál era la causa raíz
3. Cómo se corrigió

```
✅ El sidebar no se cerraba al navegar en mobile. La causa era que `sidebarOpen`
   no se reseteaba al cambiar de ruta. Se agrega un efecto en `AppLayout` que
   llama a `setSidebarOpen(false)` al detectar cambios en `location.pathname`.
```

### Refactor

Aclarar explícitamente que no hay cambio de comportamiento observable. Explicar la motivación (deuda técnica, escalabilidad, consistencia con el resto del codebase).

```
✅ Extrae la lógica de paginación duplicada en tres features a un hook genérico
   `usePaginatedQuery` en `shared/hooks/`. Sin cambio de comportamiento; los
   features afectados fueron actualizados para usar el nuevo hook.
```

### PR que depende de otro PR o del backend

Mencionarlo al inicio de la descripción:

```
✅ Depende de TESIS-88 (branch `TESIS-88-auth-endpoint` en el repo Rails).
   Requiere que el endpoint POST /auth/login esté disponible para probar el flujo completo.
```
