import { create } from 'zustand'

export type NotificationSeverity = 'success' | 'info' | 'warning' | 'error'

export interface Notification {
  id: number
  message: string
  severity: NotificationSeverity
}

interface NotificationState {
  notifications: Notification[]
  push: (message: string, severity?: NotificationSeverity) => void
  dismiss: (id: number) => void
}

let nextId = 0

export const useNotificationStore = create<NotificationState>()((set) => ({
  notifications: [],
  push: (message, severity = 'info') =>
    set((state) => ({
      notifications: [...state.notifications, { id: (nextId += 1), message, severity }],
    })),
  dismiss: (id) =>
    set((state) => ({ notifications: state.notifications.filter((n) => n.id !== id) })),
}))

/**
 * Notificar desde fuera de React — lo necesita el interceptor del cliente HTTP,
 * que no vive en el árbol de componentes y no puede usar hooks.
 */
export function notify(message: string, severity: NotificationSeverity = 'info'): void {
  useNotificationStore.getState().push(message, severity)
}
