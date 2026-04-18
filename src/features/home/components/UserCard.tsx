import { Card, CardContent, Typography, Avatar, Box } from '@mui/material'
import { formatDate } from 'shared/utils'

import type { User } from '../types'

interface UserCardProps {
  user: User
}

export function UserCard({ user }: UserCardProps) {
  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar sx={{ bgcolor: 'primary.main' }}>{user.name.charAt(0).toUpperCase()}</Avatar>
          <Box>
            <Typography variant="subtitle1" fontWeight={600}>
              {user.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {user.email}
            </Typography>
            <Typography variant="caption" color="text.disabled">
              Registrado {formatDate(user.createdAt)}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}
