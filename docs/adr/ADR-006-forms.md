# ADR-006: Gestión de Formularios y Validación

**Fecha:** 2026-04-03  
**Estado:** Aceptado

---

## Contexto

La aplicación incluirá formularios para entrada de datos (registro, login, creación/edición de entidades). Se necesita una solución que maneje:
- Estado del formulario (valores, touched, dirty)
- Validación sincrónica y asincrónica
- Mensajes de error
- Integración con TypeScript para tipado de los datos del formulario
- Compatibilidad con componentes MUI

## Decisión

Se adopta **React Hook Form v7** para la gestión del estado del formulario y **Zod v4** para la definición de schemas de validación.

La integración se realiza mediante `@hookform/resolvers/zod`.

Patrón estándar:
```ts
const schema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
})

type FormData = z.infer<typeof schema>

const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
  resolver: zodResolver(schema),
})
```

## Alternativas consideradas

### Formik
- ✅ Solución madura y ampliamente adoptada
- ❌ Más re-renders que React Hook Form (usa Context internamente)
- ❌ API más verbosa
- ❌ Desarrollo más lento en los últimos años

### Validación manual con Yup
- ✅ Compatible con React Hook Form
- ❌ Zod tiene mejor integración con TypeScript (inferencia de tipos automática)
- ❌ Zod v4 es más performante y con mejor DX

### Formularios controlados nativos (useState)
- ✅ Sin dependencias
- ❌ Mucho código boilerplate
- ❌ Re-renders en cada keystroke
- ❌ Validación manual tedios

## Consecuencias

- ✅ React Hook Form usa refs, no estado: mínimos re-renders
- ✅ Zod infiere automáticamente los tipos TypeScript desde el schema (`z.infer<typeof schema>`)
- ✅ Un único schema define tanto la validación como los tipos — Single Source of Truth
- ✅ El mismo schema puede usarse para validar datos del servidor (API responses)
- ✅ Integración limpia con componentes de MUI mediante el patrón `Controller`
- ⚠️ Zod v4 tiene cambios de API respecto a v3 — revisar la documentación actualizada al agregar nuevos schemas
