import {
  SectionBar,
  SectionHeadingRow,
  SectionTitle,
  SectionTitleGroup,
} from './EditProductModal.styles'
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
        <SectionTitle variant="labelMd" as="h3">
          {title}
        </SectionTitle>
      </SectionTitleGroup>
      {action}
    </SectionHeadingRow>
  )
}
