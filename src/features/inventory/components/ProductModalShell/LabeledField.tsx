import { Typography } from '@mui/material'

import type { LabeledFieldProps } from './LabeledField.types'
import { FieldLabel, FieldRoot, FullRow } from './ProductModalShell.styles'

/**
 * Campo con el label arriba del input, como pide el DS (MUI por defecto lo
 * flota dentro del borde).
 *
 * El contenedor se renderiza como `<label>`: envolver al input asocia ambos sin
 * tener que inyectarle un `id` desde afuera, y de paso hace clickeable el texto.
 */
export function LabeledField({
  label,
  children,
  error,
  helperText,
  fullWidth = false,
}: LabeledFieldProps) {
  const message = error ?? helperText
  const Wrapper = fullWidth ? FullRow : FieldRoot

  return (
    <Wrapper as="label">
      <FieldLabel variant="labelSm" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
        {label}
      </FieldLabel>
      {children}
      {message === undefined ? null : (
        <Typography
          variant="labelSm"
          // `role="alert"` solo cuando es un error: los helpers estáticos no
          // deben interrumpir al lector de pantalla.
          role={error === undefined ? undefined : 'alert'}
          sx={{ mt: 0.5, color: error === undefined ? 'text.secondary' : 'error.main' }}
        >
          {message}
        </Typography>
      )}
    </Wrapper>
  )
}
