import { useState } from 'react';
import { useNotificationsPolling } from '../../hooks/useNotificationsPolling';
import { useNotificationStore } from '../../store/notificationStore';
import { formatDistanceToNow } from 'date-fns';

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  useNotificationsPolling(open);

  const notifications = useNotificationStore((s) => s.notifications);
  const markAsRead = useNotificationStore((s) => s.markAsRead);
  const markAllAsRead = useNotificationStore((s) => s.markAllAsRead);
  const unreadCount = useNotificationStore((s) => s.unreadCount());
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const visible = notifications.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.max(1, Math.ceil(notifications.length / pageSize));

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={`Notifications, ${unreadCount} unread`}
        className="relative rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        <span aria-hidden="true">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-w-[90vw] rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl z-40 animate-fade-in">
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold">Notifications</h3>
            <button onClick={markAllAsRead} className="text-xs text-primary-600 hover:underline">
              Mark all read
            </button>
          </div>
          <ul className="max-h-80 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700">
            {visible.length === 0 && (
              <li className="px-4 py-6 text-center text-sm text-gray-400">No notifications yet</li>
            )}
            {visible.map((n) => (
              <li
                key={n.id}
                className={`px-4 py-3 text-sm cursor-pointer ${!n.read ? 'bg-primary-50 dark:bg-primary-900/20' : ''}`}
                onClick={() => markAsRead(n.id)}
              >
                <p className="font-medium line-clamp-1">{n.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                </p>
              </li>
            ))}
          </ul>
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-2 text-xs border-t border-gray-200 dark:border-gray-700">
              <button disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="disabled:opacity-40">
                Prev
              </button>
              <span>{page} / {totalPages}</span>
              <button disabled={page === totalPages} onClick={() => setPage((p) => p + 1)} className="disabled:opacity-40">
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
