import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { taskApi } from '../api/taskApi';
import { useBoardStore } from '../store/boardStore';

// Server-state layer: TanStack Query owns fetching/caching of the initial
// dataset. Once loaded, it hydrates the Zustand board store exactly once —
// after that, board mutations (move/add/delete/edit) live entirely in
// client state so drag-and-drop stays instant and persists across refresh.
export function useTasksQuery() {
  const hydrate = useBoardStore((s) => s.hydrate);
  const hydrated = useBoardStore((s) => s.hydrated);

  const query = useQuery({
    queryKey: ['sprint-dataset'],
    queryFn: taskApi.fetchDataset,
    staleTime: 5 * 60 * 1000,
    enabled: !hydrated,
  });

  useEffect(() => {
    if (query.data && !hydrated) {
      hydrate(query.data.tasks);
    }
  }, [query.data, hydrated, hydrate]);

  return query;
}

export function useUsersQuery() {
  return useQuery({
    queryKey: ['sprint-dataset'],
    queryFn: taskApi.fetchDataset,
    staleTime: 5 * 60 * 1000,
    select: (data) => data.users,
  });
}
