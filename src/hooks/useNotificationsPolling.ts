import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { notificationApi } from '../api/notificationApi';
import { useNotificationStore } from '../store/notificationStore';
import { useToast } from './useToast';

const POLL_INTERVAL = 15000;

// Simulated real-time notifications via polling. Pauses while the tab is
// hidden (Page Visibility API) and resumes on focus, per the spec.
export function useNotificationsPolling(panelOpen: boolean) {
  const addNotifications = useNotificationStore((s) => s.addNotifications);
  const { showToast } = useToast();
  const isVisible = useRef(!document.hidden);

  const query = useQuery({
    queryKey: ['notifications-poll'],
    queryFn: notificationApi.fetchLatestPosts,
    refetchInterval: () => (isVisible.current ? POLL_INTERVAL : false),
    refetchIntervalInBackground: false,
  });

  useEffect(() => {
    const handleVisibility = () => {
      isVisible.current = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  useEffect(() => {
    if (!query.data) return;
    const fresh = addNotifications(query.data);
    if (fresh.length > 0 && !panelOpen) {
      showToast(
        fresh.length === 1 ? `New notification: ${fresh[0].title}` : `${fresh.length} new notifications`,
        'info'
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.data]);

  return query;
}
