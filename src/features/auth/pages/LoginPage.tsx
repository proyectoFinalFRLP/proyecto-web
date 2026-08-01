import { Box, Paper, Typography } from '@mui/material'

/**
 * Marcador de posición de la pantalla de ingreso.
 *
 * La UI real de login y registro es TESIS-51: esta card (TESIS-100) sólo aporta
 * la capa de sesión, y necesita que la ruta exista para poder redirigir acá
 * cuando no hay token. Al implementarse TESIS-51 se reemplaza este contenido por
 * el formulario, que debe llamar a `useAuthStore().login(token, email)` con el
 * token que devuelve `POST /auth/login`.
 */
export function LoginPage() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 2,
      }}
    >
      <Paper sx={{ p: 4, maxWidth: 420, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>
          Iniciar sesión
        </Typography>
        <Typography variant="body2" color="text.secondary">
          El formulario de ingreso llega con TESIS-51. Esta pantalla existe para que las rutas
          privadas tengan a dónde redirigir mientras tanto.
        </Typography>
      </Paper>
    </Box>
  )
}
