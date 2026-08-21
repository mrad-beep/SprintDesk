import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppNotification } from '../types';

interface NotificationState {
  notifications: AppNotification[];
  knownIds: number[];
  addNotifications: (incoming: AppNotification[]) => AppNotification[]; // returns newly-added
  markAsRead: (id: number) => void;
  markAllAsRead: () => void;
  unreadCount: () => number;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [],
      knownIds: [],

      addNotifications: (incoming) => {
        const { knownIds, notifications } = get();
        const fresh = incoming.filter((n) => !knownIds.includes(n.id));
        if (fresh.length === 0) return [];
        set({
          notifications: [...fresh, ...notifications].slice(0, 200),
          knownIds: [...knownIds, ...fresh.map((n) => n.id)],
        });
        return fresh;
      },

      markAsRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        })),

      markAllAsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
        })),

      unreadCount: () => get().notifications.filter((n) => !n.read).length,
    }),
    { name: 'sprintdesk-notifications' }
  )
);
