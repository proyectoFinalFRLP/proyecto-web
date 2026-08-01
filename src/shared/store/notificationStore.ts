import { create } from 'zustand'

export type NotificationSeverity = 'error' | 'warning' | 'info' | 'success'

export interface Notification {
  id: number
  message: string
  severity: NotificationSeverity
}

interface NotificationState {
  notifications: Notification[]
  notify: (message: string, severity?: NotificationSeverity) => void
  dismiss: (id: number) => void
}

let nextId = 0

export const useNotificationStore = create<NotificationState>()((set) => ({
  notifications: [],

  notify: (message, severity = 'info') =>
    set((state) => ({
      notifications: [...state.notifications, { id: (nextId += 1), message, severity }],
    })),

  dismiss: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((notification) => notification.id !== id),
    })),
}))

/** Emite una notificación fuera de React (interceptores de Axios). */
export function notify(message: string, severity: NotificationSeverity = 'info'): void {
  useNotificationStore.getState().notify(message, severity)
}
