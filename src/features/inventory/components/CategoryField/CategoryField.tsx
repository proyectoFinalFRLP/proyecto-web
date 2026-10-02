import { MenuItem, TextField } from '@mui/material'
import { LabeledField } from 'shared/components'

import { categoryOptions } from '../../utils/categories'

import type { CategoryFieldProps } from './CategoryField.types'

/**
 * El select de categoría de los dos modales de producto (Regla de Dos).
 *
 * Controlado y no registrado: el modal de edición se rellena con `reset` al
 * abrir, y un select no controlado seguiría mostrando lo que tenía antes.
 *
 * Las opciones salen de `GET /products/categories`, más la del producto si la
 * lista no la trae (ver `categoryOptions`): guardar no la borra por accidente.
 */
export function CategoryField({
  value,
  onChange,
  categories,
  label,
  helperText,
  noneLabel,
}: CategoryFieldProps) {
  const options = categoryOptions(categories, value)

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
