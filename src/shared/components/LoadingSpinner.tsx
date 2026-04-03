import { Box, CircularProgress } from '@mui/material'

interface LoadingSpinnerProps {
  fullScreen?: boolean
}

export function LoadingSpinner({ fullScreen = false }: LoadingSpinnerProps) {
  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      sx={fullScreen ? { height: '100vh', width: '100%' } : { p: 4 }}
    >
      <CircularProgress />
    </Box>
  )
}
