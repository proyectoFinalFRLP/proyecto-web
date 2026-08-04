import { Box, Button, Card, Stack, Typography } from '@mui/material'
import { ProgressIndicator } from 'shared/components'

import { operationalStatus } from '../content'

/**
 * Composición del spec: métricas en vivo sobre una superficie elevada, con la
 * latencia en tono de éxito y una barra fina como carga del nodo.
 */
export function OperationalStatusCard() {
  const metrics = [
    {
      label: operationalStatus.latencyLabel,
      value: operationalStatus.latencyValue,
      color: 'success.main',
    },
    {
      label: operationalStatus.throughputLabel,
      value: operationalStatus.throughputValue,
      color: 'text.primary',
    },
  ]

  return (
    <Card
      sx={{
        p: 3,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
        bgcolor: 'background.containerHighest',
      }}
    >
      <Box>
        <Typography
          variant="labelSm"
          color="text.secondary"
          sx={{ textTransform: 'uppercase', letterSpacing: '0.1em' }}
        >
          {operationalStatus.eyebrow}
        </Typography>
        <Typography variant="h2">{operationalStatus.headline}</Typography>
      </Box>

      <Stack spacing={2} sx={{ flexGrow: 1 }}>
        {metrics.map((metric) => (
          <Box
            key={metric.label}
            sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
          >
            <Typography variant="bodyMd" color="text.secondary">
              {metric.label}
            </Typography>
            <Typography variant="labelMd" color={metric.color}>
              {metric.value}
            </Typography>
          </Box>
        ))}
        <ProgressIndicator size="thin" tone="info" value={operationalStatus.load} />
      </Stack>

      {/* El spec lo pinta como acción tenue de marca, no como botón neutro. */}
      <Button
        variant="outlined"
        color="primary"
        fullWidth
        sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: 12 }}
      >
        {operationalStatus.action}
      </Button>
    </Card>
  )
}
