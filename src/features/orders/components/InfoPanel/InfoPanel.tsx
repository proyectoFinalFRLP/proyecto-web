import { Typography } from '@mui/material'
import { useId } from 'react'

import { Field, FieldList, FieldValue, PanelCard, PanelHeading } from './InfoPanel.styles'
import type { InfoPanelProps } from './InfoPanel.types'

/**
 * Panel lateral de datos de S08 («Datos del cliente», «Datos del envío»): un
 * rótulo y una lista de pares rótulo-valor.
 *
 * La lista es un `<dl>`: son definiciones, y así el lector de pantalla anuncia
 * cada valor con su rótulo.
 */
export function InfoPanel({ title, icon, fields, children, footnote }: InfoPanelProps) {
  const titleId = useId()

  return (
    <PanelCard component="section" aria-labelledby={titleId}>
      <PanelHeading>
        <Typography id={titleId} variant="labelCaps" component="h2">
          {title}
        </Typography>
        {icon}
      </PanelHeading>

      {children}

      <FieldList as="dl">
        {fields.map((field) => (
          <Field key={field.id}>
            <Typography variant="labelSm" color="text.secondary" component="dt">
              {field.label}
            </Typography>
            <FieldValue component="dd" mono={Boolean(field.mono)} unknown={Boolean(field.unknown)}>
              {field.value}
            </FieldValue>
          </Field>
        ))}
      </FieldList>

      {footnote === undefined ? null : (
        <Typography variant="labelSm" color="text.secondary">
          {footnote}
        </Typography>
      )}
    </PanelCard>
  )
}
