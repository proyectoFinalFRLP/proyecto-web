import { Box, type BoxProps } from '@mui/material'
import type { ReactNode } from 'react'

interface PageWrapperProps extends BoxProps {
  children: ReactNode
}

export function PageWrapper({ children, sx, ...props }: PageWrapperProps) {
  return (
    <Box
      component="main"
      {...props}
      // El `sx` de quien lo usa se suma al base en vez de reemplazarlo: con un
      // spread, `sx={{ maxWidth: 1400 }}` borraba el padding y el centrado
      // (TESIS-132).
      sx={[
        {
          p: { xs: 2, md: 3 },
          maxWidth: 1200,
          mx: 'auto',
          width: '100%',
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {children}
    </Box>
  )
}
