# Git workflow

## 1. Ramas

**Formato requerido:**

```
TESIS-<número>-<descripción-corta-en-kebab-case>
```

**Ramas especiales permitidas:** `main`, `develop`, `staging`, `hotfix/*`, `release/*`

```
TESIS-42-user-authentication
TESIS-87-fix-sidebar-collapse
TESIS-12-add-architecture-adrs
```

El formato es validado localmente en el hook `pre-push` (Husky) y en el CI de GitHub Actions en cada PR.

---

## 2. Commits (Conventional Commits)

**Formato:** `<tipo>: <descripción en inglés>`

| Tipo | Cuándo usarlo |
|---|---|
| `feat` | Nueva funcionalidad |
| `fix` | Corrección de bug |
| `refactor` | Cambio de código sin nueva feature ni bug fix |
| `style` | Cambios de formato o espaciado (sin lógica) |
| `docs` | Cambios en documentación |
| `chore` | Mantenimiento (dependencias, configuraciones, etc.) |
| `test` | Agregar o modificar tests |
| `perf` | Mejoras de rendimiento |

**Reglas:**
- Descripción en **inglés**
- Modo **imperativo** ("add", no "added" ni "adds")
- Sin mayúscula inicial en la descripción
- Sin punto al final
- Máximo **100 caracteres** en la primera línea

```
feat: add user authentication flow
fix: correct sidebar collapse on mobile
refactor: extract api client interceptors
docs: update README with architecture guide
chore: upgrade MUI to v7
```

El formato es validado en el hook `commit-msg` por commitlint.

---

## 3. Pull Requests

**Título:** `<tipo>: [TESIS-XXX] short description in english`

```
feat: [TESIS-42] add user authentication
fix: [TESIS-87] fix sidebar collapse on mobile
docs: [TESIS-12] add architecture guidelines
```

**Reglas:**
- 1 PR por card de Jira
- El PR debe pasar build (`npm run build`) y lint (`npm run lint`) antes de solicitar review
- Mínimo **1 aprobación** requerida para hacer merge
- No mergear a `master` sin PR aprobado
- Si el PR introduce un nuevo patrón o decisión arquitectural, actualizar o crear el ADR correspondiente en `docs/adr/`

La plantilla de descripción en `.github/pull_request_template.md` se carga automáticamente al abrir un PR. Incluye: link al ticket Jira, descripción, cambios realizados, evidencia visual, pasos para probar e impacto.

---

## 4. Flujo de trabajo

```
master
  └── TESIS-123-feature-name   ← branch por card
        └── commits atómicos y descriptivos
              └── PR: feat: [TESIS-123] feature name
                    └── code review → merge a master
```

---

## 5. Hooks de Git (Husky)

| Hook | Acción |
|---|---|
| `commit-msg` | Valida el mensaje de commit con commitlint |
| `pre-push` | Valida el nombre de la rama + ejecuta `npm run lint` |
| `pre-commit` | Sin configuración activa actualmente |

> `lint-staged` está configurado en `package.json` pero no está asignado a ningún hook activo. El lint completo corre en `pre-push`.

---

## 6. CI/CD (GitHub Actions)

Pipeline en `.github/workflows/ci.yml`. Se dispara en push y pull_request sobre `main`, `master` y `develop`.

| Job | Acción | Dependencia |
|---|---|---|
| `lint` | ESLint (`--max-warnings 0`) + Prettier check | — |
| `branch-name` | Valida nombre de rama (solo en PRs) | — |
| `build` | `npm run build` (tsc + vite) | `lint` |

El job `build` solo corre si `lint` pasa.
