import { Typography } from '@mui/material'

import { SectionAction, SectionHeadingRow, SectionIconBox } from './CreateProductModal.styles'
import type { SectionHeadingProps } from './CreateProductModal.types'

/**
 * Encabezado de sección del modal de alta: ícono en recuadro tintado + título.
 *
 * Se renderiza como `<h3>` para que el modal tenga jerarquía navegable por
 * lector de pantalla; el ícono es decorativo y no se anuncia.
 */
export function SectionHeading({ icon, title, action }: SectionHeadingProps) {
  return (
    <SectionHeadingRow>
      <SectionIconBox aria-hidden>{icon}</SectionIconBox>
      <Typography variant="h3" component="h3">
        {title}
      </Typography>
      {action === undefined ? null : <SectionAction>{action}</SectionAction>}
    </SectionHeadingRow>
  )
}
