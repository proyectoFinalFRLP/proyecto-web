import { Typography } from '@mui/material'
import { useId } from 'react'

import { SectionCard, SectionHeading } from './FormSection.styles'
import type { FormSectionProps } from './FormSection.types'

/**
 * Tarjeta de sección de los formularios del alta manual: ícono, título `h2` y
 * contenido. Es la región con nombre que un lector de pantalla anuncia al entrar
 * («Datos del cliente», «Depósito de origen»…).
 *
 * Nació en «Datos del cliente» del paso 1 y se extrajo cuando el paso 2 la
 * necesitó dos veces (Regla de Dos, feature-structure.md §6).
 */
export function FormSection({ icon, title, children }: FormSectionProps) {
  const titleId = useId()

  return (
    <SectionCard component="section" aria-labelledby={titleId}>
      <SectionHeading>
        {icon}
        <Typography id={titleId} variant="h3" component="h2">
          {title}
        </Typography>
      </SectionHeading>
      {children}
    </SectionCard>
  )
}
