import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line,
} from 'recharts';
import { useTasksQuery } from '../hooks/useTasksQuery';
import { useBoardStore, COLUMNS } from '../store/boardStore';
import { Skeleton } from '../components/ui/Skeleton';

const PRIORITY_COLORS: Record<string, string> = { low: '#60a5fa', medium: '#f59e0b', high: '#ef4444' };
const STATUS_COLORS = ['#94a3b8', '#3b82f6', '#f59e0b', '#22c55e'];

export function AnalyticsPage() {
  const { isLoading } = useTasksQuery();
  const tasks = useBoardStore((s) => s.tasks);

  const statusData = useMemo(
    () => COLUMNS.map((c) => ({ name: c.label, value: tasks.filter((t) => t.status === c.id).length })),
    [tasks]
  );

  const priorityByColumn = useMemo(
    () =>
      COLUMNS.map((c) => {
        const colTasks = tasks.filter((t) => t.status === c.id);
        return {
          name: c.label,
          low: colTasks.filter((t) => t.priority === 'low').length,
          medium: colTasks.filter((t) => t.priority === 'medium').length,
          high: colTasks.filter((t) => t.priority === 'high').length,
        };
      }),
    [tasks]
  );

  const velocityData = useMemo(() => {
    const bySprint = new Map<string, number>();
    tasks
      .filter((t) => t.status === 'done')
      .forEach((t) => bySprint.set(t.sprint, (bySprint.get(t.sprint) ?? 0) + 1));
    return Array.from(bySprint.entries()).map(([sprint, count]) => ({ sprint, completed: count }));
  }, [tasks]);

  const completionTrend = useMemo(() => {
    const done = tasks.filter((t) => t.status === 'done').sort((a, b) => a.dueDate.localeCompare(b.dueDate));
    let cumulative = 0;
    return done.map((t) => {
      cumulative += 1;
      return { date: new Date(t.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }), cumulative };
    });
  }, [tasks]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl p-6 grid sm:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-64" />)}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-6">
      <h1 className="text-xl font-semibold mb-1">Sprint Analytics</h1>
      <p className="text-sm text-gray-500 mb-6">Live data derived from the current board state.</p>

      <div className="grid sm:grid-cols-2 gap-6">
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
          <h2 className="text-sm font-semibold mb-3">Sprint Velocity</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={velocityData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="sprint" fontSize={12} />
              <YAxis allowDecimals={false} fontSize={12} />
              <Tooltip />
              <Bar dataKey="completed" fill="#3b82f6" radius={[4, 4, 0, 0]} animationDuration={600} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
          <h2 className="text-sm font-semibold mb-3">Task Status Distribution</h2>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={statusData} dataKey="value" nameKey="name" outerRadius={90} label animationDuration={600}>
                {statusData.map((_, i) => (
                  <Cell key={i} fill={STATUS_COLORS[i % STATUS_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
          <h2 className="text-sm font-semibold mb-3">Priority Breakdown by Column</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={priorityByColumn}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="name" fontSize={12} />
              <YAxis allowDecimals={false} fontSize={12} />
              <Tooltip />
              <Legend />
              <Bar dataKey="low" stackId="p" fill={PRIORITY_COLORS.low} animationDuration={600} />
              <Bar dataKey="medium" stackId="p" fill={PRIORITY_COLORS.medium} animationDuration={600} />
              <Bar dataKey="high" stackId="p" fill={PRIORITY_COLORS.high} radius={[4, 4, 0, 0]} animationDuration={600} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
          <h2 className="text-sm font-semibold mb-3">Completion Trend</h2>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={completionTrend}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="date" fontSize={12} />
              <YAxis allowDecimals={false} fontSize={12} />
              <Tooltip />
              <Line type="monotone" dataKey="cumulative" stroke="#22c55e" strokeWidth={2} animationDuration={600} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
