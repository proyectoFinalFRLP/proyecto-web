import { Typography } from '@mui/material'

import { SectionBar, SectionHeadingRow, SectionTitleGroup } from './EditProductModal.styles'
import type { SectionHeadingProps } from './EditProductModal.types'

/**
 * Encabezado de sección del modal: barra de acento + título en versalitas.
 *
 * Se renderiza como `<h3>` para que el modal tenga jerarquía de headings navegable
 * por lector de pantalla; la barra es decorativa y no se anuncia.
 */
export function SectionHeading({ title, action }: SectionHeadingProps) {
  return (
    <SectionHeadingRow>
      <SectionTitleGroup>
        <SectionBar aria-hidden />
        <Typography
          variant="labelMd"
          component="h3"
          sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}
        >
          {title}
        </Typography>
      </SectionTitleGroup>
      {action}
    </SectionHeadingRow>
  )
}
