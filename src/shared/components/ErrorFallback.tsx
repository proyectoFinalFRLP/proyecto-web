import { Box, Button, Typography } from '@mui/material'

interface ErrorFallbackProps {
  error?: Error
  onRetry?: () => void
}

export function ErrorFallback({ error, onRetry }: ErrorFallbackProps) {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      gap={2}
      sx={{ p: 4 }}
    >
      <Typography variant="h6" color="error">
        Algo salió mal
      </Typography>
      {error ? (
        <Typography variant="body2" color="text.secondary">
          {error.message}
        </Typography>
      ) : null}
      {onRetry ? (
        <Button variant="outlined" onClick={onRetry}>
          Reintentar
        </Button>
      ) : null}
    </Box>
  )
}
