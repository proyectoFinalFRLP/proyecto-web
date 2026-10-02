import { MenuItem, TextField } from '@mui/material'
import { LabeledField } from 'shared/components'

import type { CategoryFieldProps } from './CategoryField.types'

/**
 * El select de categoría de los dos modales de producto (Regla de Dos).
 *
 * Controlado y no registrado: el modal de edición se rellena con `reset` al
 * abrir, y un select no controlado seguiría mostrando lo que tenía antes.
 *
 * Las opciones salen de `GET /products/categories`. Si la API todavía no
 * respondió, o el producto trae una categoría que ya no está en el
 * vocabulario, ese valor se ofrece igual: sin eso el select lo mostraría vacío
 * y guardar lo borraría sin que nadie lo haya pedido.
 */
export function CategoryField({
  value,
  onChange,
  categories,
  label,
  helperText,
  noneLabel,
}: CategoryFieldProps) {
  const options = value !== '' && !categories.includes(value) ? [value, ...categories] : categories

  return (
    <LabeledField label={label} helperText={helperText}>
      <TextField
        select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        fullWidth
        // El `<label>` de LabeledField no nombra al combobox: el Select de MUI
        // lo dibuja en un `div`, que no es un control etiquetable.
        slotProps={{ select: { SelectDisplayProps: { 'aria-label': label }, displayEmpty: true } }}
      >
        <MenuItem value="">{noneLabel}</MenuItem>
        {options.map((category) => (
          <MenuItem key={category} value={category}>
            {category}
          </MenuItem>
        ))}
      </TextField>
    </LabeledField>
  )
}
