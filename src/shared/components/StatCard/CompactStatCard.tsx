import { Typography } from '@mui/material'

import { CompactBody, CompactIconBox, CompactRoot } from './StatCard.styles'
import type { CompactStatCardProps } from './StatCard.types'

/**
 * Métrica secundaria: una sola fila, sin tendencia ni comparativa. Para las
 * cifras de apoyo que acompañan a las tarjetas principales.
 */
export function CompactStatCard({ label, value, icon, tone = 'neutral' }: CompactStatCardProps) {
  return (
    <CompactRoot>
      {icon ? <CompactIconBox tone={tone}>{icon}</CompactIconBox> : null}
      <CompactBody>
        <Typography variant="labelSm" color="text.secondary" sx={{ textTransform: 'uppercase' }}>
          {label}
        </Typography>
        {/* El valor es un dato, no un título (mismo criterio que StatCard). */}
        <Typography variant="h2" component="p">
          {value}
        </Typography>
      </CompactBody>
    </CompactRoot>
  )
}
