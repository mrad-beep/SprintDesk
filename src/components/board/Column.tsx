import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { ColumnId, Task, User } from '../../types';
import { TaskCard } from './TaskCard';

interface ColumnProps {
  id: ColumnId;
  label: string;
  tasks: Task[];
  users: User[];
  onOpenTask: (task: Task) => void;
}

export function Column({ id, label, tasks, users, onOpenTask }: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div className="flex w-72 shrink-0 flex-col rounded-lg bg-gray-100 dark:bg-gray-800/60 p-3">
      <div className="mb-3 flex items-center justify-between px-1">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200">{label}</h2>
        <span className="rounded-full bg-gray-200 dark:bg-gray-700 px-2 py-0.5 text-xs text-gray-600 dark:text-gray-300">
          {tasks.length}
        </span>
      </div>
      <div
        ref={setNodeRef}
        className={`flex flex-1 flex-col gap-2 rounded-md p-1 min-h-[120px] transition-colors ${
          isOver ? 'bg-primary-50 dark:bg-primary-900/20 ring-2 ring-primary-300' : ''
        }`}
      >
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              assignee={users.find((u) => u.id === task.assigneeId)}
              onOpen={onOpenTask}
            />
          ))}
        </SortableContext>
        {tasks.length === 0 && (
          <p className="px-2 py-4 text-center text-xs text-gray-400">Drop tasks here</p>
        )}
      </div>
    </div>
  );
}
