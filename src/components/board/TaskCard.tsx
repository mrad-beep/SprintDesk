import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import clsx from 'clsx';
import type { Task, User } from '../../types';

const priorityColors: Record<Task['priority'], string> = {
  low: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  high: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
};

interface TaskCardProps {
  task: Task;
  assignee?: User;
  onOpen: (task: Task) => void;
}

export function TaskCard({ task, assignee, onOpen }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      role="button"
      tabIndex={0}
      onClick={() => onOpen(task)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen(task);
        }
      }}
      aria-label={`Task: ${task.title}, priority ${task.priority}. Press Enter to view details.`}
      className="cursor-grab active:cursor-grabbing rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 shadow-sm hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 transition-shadow"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-2">{task.title}</p>
        <span className={clsx('shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase', priorityColors[task.priority])}>
          {task.priority}
        </span>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs text-gray-500 dark:text-gray-400">
          Due {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
        </span>
        {assignee && (
          <img
            src={assignee.avatar}
            alt={assignee.name}
            title={assignee.name}
            className="h-6 w-6 rounded-full object-cover"
          />
        )}
      </div>
    </div>
  );
}
