import { Box, type BoxProps } from '@mui/material'
import type { ReactNode } from 'react'

interface PageWrapperProps extends BoxProps {
  children: ReactNode
}

export function PageWrapper({ children, ...props }: PageWrapperProps) {
  return (
    <Box
      component="main"
      sx={{
        p: { xs: 2, md: 3 },
        maxWidth: 1200,
        mx: 'auto',
        width: '100%',
      }}
      {...props}
    >
      {children}
    </Box>
  )
}
