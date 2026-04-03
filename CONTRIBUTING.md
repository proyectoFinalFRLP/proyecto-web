# Guía de contribución

## Ramas

Las ramas deben nombrarse con el código de la card de Jira seguido de una descripción corta:

```
TESIS-123-short-description
```

Ejemplos:

- `TESIS-42-user-authentication`
- `TESIS-87-fix-sidebar-collapse`

---

## Commits

El formato de los mensajes de commit sigue la convención [Conventional Commits](https://www.conventionalcommits.org/):

```
<tipo>: <descripción en inglés>
```

### Tipos permitidos

| Tipo       | Cuándo usarlo                                         |
| ---------- | ----------------------------------------------------- |
| `feat`     | Agregar una nueva funcionalidad                       |
| `fix`      | Corregir un bug                                       |
| `refactor` | Cambio de código que no agrega feature ni corrige bug |
| `style`    | Cambios de formato, espaciado, etc. (sin lógica)      |
| `docs`     | Cambios en documentación                              |
| `chore`    | Tareas de mantenimiento (deps, configs, etc.)         |
| `test`     | Agregar o modificar tests                             |
| `perf`     | Mejoras de rendimiento                                |

### Ejemplos

```
feat: add user authentication flow
fix: correct sidebar collapse on mobile
refactor: extract api client interceptors
docs: update README with architecture guide
chore: upgrade MUI to v7
```

### Reglas

- La descripción va en **inglés**
- Usar **modo imperativo** ("add", no "added" ni "adds")
- Sin mayúscula inicial en la descripción
- Sin punto al final
- Máximo 72 caracteres en la primera línea

---

## Pull Requests

### Título

```
<tipo>: [TESIS-123] short description in english
```

Ejemplos:

- `feat: [TESIS-42] add user authentication`
- `fix: [TESIS-87] fix sidebar collapse on mobile`
- `docs: [TESIS-12] add architecture ADRs`

### Descripción

Usar el template disponible en `.github/pull_request_template.md` al abrir el PR (GitHub lo carga automáticamente).

### Reglas

- Un PR por card de Jira
- El PR debe pasar el build (`npm run build`) y el lint (`npm run lint`) antes de solicitar review
- Mínimo 1 aprobación requerida para hacer merge
- No hacer merge a `master` sin PR aprobado

---

## Flujo de trabajo

```
master
  └── TESIS-123-feature-name   ← branch por card
        └── commits atómicos y descriptivos
              └── PR: feat: [TESIS-123] feature name
                    └── code review → merge a master
```
