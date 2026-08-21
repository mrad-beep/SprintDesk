import { useMemo } from 'react';
import { useAuthStore } from '../store/authStore';
import { useTasksQuery, useUsersQuery } from '../hooks/useTasksQuery';
import { useBoardStore, COLUMNS } from '../store/boardStore';
import { Skeleton } from '../components/ui/Skeleton';
import { DataTable, type Column as TableColumn } from '../components/ui/DataTable';
import type { Task } from '../types';

export function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { isLoading } = useTasksQuery();
  const { data: users = [] } = useUsersQuery();
  const tasks = useBoardStore((s) => s.tasks);

  const counts = useMemo(
    () => COLUMNS.map((c) => ({ ...c, count: tasks.filter((t) => t.status === c.id).length })),
    [tasks]
  );

  const dueSoon = useMemo(
    () =>
      [...tasks]
        .filter((t) => t.status !== 'done')
        .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
        .slice(0, 6),
    [tasks]
  );

  const columns: TableColumn<Task>[] = [
    { key: 'title', header: 'Task', sortable: true },
    {
      key: 'priority',
      header: 'Priority',
      sortable: true,
      render: (row) => <span className="capitalize">{row.priority}</span>,
    },
    {
      key: 'assigneeId',
      header: 'Assignee',
      render: (row) => users.find((u) => u.id === row.assigneeId)?.name ?? '—',
    },
    { key: 'dueDate', header: 'Due date', sortable: true },
  ];

  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-6">
      <h1 className="text-xl font-semibold mb-1">Welcome back{user ? `, ${user.firstName}` : ''} 👋</h1>
      <p className="text-sm text-gray-500 mb-6">Here's what's happening in Sprint 12.</p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20" />)
          : counts.map((c) => (
              <div key={c.id} className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
                <p className="text-2xl font-bold">{c.count}</p>
                <p className="text-xs text-gray-500">{c.label}</p>
              </div>
            ))}
      </div>

      <h2 className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-200">All sprint tasks</h2>
      {isLoading ? <Skeleton className="h-64 w-full" /> : <DataTable columns={columns} rows={tasks} pageSize={6} />}

      {!isLoading && dueSoon.length > 0 && (
        <div className="mt-8">
          <h2 className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-200">Due soon</h2>
          <ul className="grid sm:grid-cols-2 gap-2">
            {dueSoon.map((t) => (
              <li key={t.id} className="rounded-md border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm flex justify-between">
                <span>{t.title}</span>
                <span className="text-gray-400">{new Date(t.dueDate).toLocaleDateString()}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
