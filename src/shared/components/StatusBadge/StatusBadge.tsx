import { BadgeRoot } from './StatusBadge.styles'
import type { StatusBadgeProps } from './StatusBadge.types'

// Regla del DS: nunca color solo — siempre color + texto (el ícono es opcional).
// Si recibe `onClick` se renderiza como <button> (hover, focus ring, cursor).
export function StatusBadge({
  status,
  label,
  size = 'md',
  icon,
  endIcon,
  onClick,
  ...rest
}: StatusBadgeProps) {
  const interactive = Boolean(onClick)

  return (
    <BadgeRoot
      as={interactive ? 'button' : 'span'}
      type={interactive ? 'button' : undefined}
      onClick={onClick}
      statusColor={status}
      badgeSize={size}
      interactive={interactive}
      {...rest}
    >
      {icon}
      {label}
      {endIcon}
    </BadgeRoot>
  )
}
