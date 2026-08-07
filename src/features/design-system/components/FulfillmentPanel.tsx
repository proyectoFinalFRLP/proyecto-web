import { Box, Card, Stack, Typography } from '@mui/material'
import { ProgressIndicator } from 'shared/components'

import { fulfillmentPanel, fulfillmentRegions } from '../content'

const REGION_LABEL_WIDTH = 120

/**
 * Composición del spec: una lista de barras `inline` comparables entre sí. El
 * ancho fijo del label es lo que alinea el arranque de todas las barras.
 */
export function FulfillmentPanel() {
  return (
    <Card sx={{ p: 3, height: '100%' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h1">{fulfillmentPanel.title}</Typography>
        <Typography variant="bodyMd" color="text.secondary">
          {fulfillmentPanel.subtitle}
        </Typography>
      </Box>
      <Stack spacing={2}>
        {fulfillmentRegions.map((region) => (
          <ProgressIndicator
            key={region.label}
            layout="inline"
            size="large"
            showValue
            label={region.label}
            value={region.value}
            tone={region.tone}
            labelWidth={REGION_LABEL_WIDTH}
          />
        ))}
      </Stack>
    </Card>
  )
}
