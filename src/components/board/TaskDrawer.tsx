import { useState, type FormEvent } from 'react';
import type { Task, User } from '../../types';
import { useBoardStore } from '../../store/boardStore';
import { PRIORITIES } from '../../store/boardStore';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { Input } from '../ui/Input';
import { useToast } from '../../hooks/useToast';

interface TaskDrawerProps {
  task: Task | null;
  users: User[];
  onClose: () => void;
  onDeleteRequest: (task: Task) => void;
}

export function TaskDrawer({ task, users, onClose, onDeleteRequest }: TaskDrawerProps) {
  const updateTask = useBoardStore((s) => s.updateTask);
  const addComment = useBoardStore((s) => s.addComment);
  const { showToast } = useToast();
  const [commentText, setCommentText] = useState('');

  if (!task) return null;

  const handleField = (field: keyof Task, value: string) => {
    updateTask(task.id, { [field]: value } as Partial<Task>);
  };

  const submitComment = (e: FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addComment(task.id, {
      id: Date.now(),
      author: 'You',
      text: commentText.trim(),
      createdAt: new Date().toISOString(),
    });
    setCommentText('');
    showToast('Comment added', 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40 animate-fade-in" onClick={onClose} aria-hidden="true" />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={`Task details: ${task.title}`}
        className="relative z-10 h-full w-full max-w-md overflow-y-auto bg-white dark:bg-gray-900 p-6 shadow-2xl animate-slide-in"
      >
        <div className="flex items-start justify-between">
          <h2 className="text-lg font-semibold pr-4">{task.title}</h2>
          <button onClick={onClose} aria-label="Close task details" className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
            ✕
          </button>
        </div>

        <div className="mt-4 flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-gray-700 dark:text-gray-200">Description</span>
            <textarea
              className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              rows={3}
              defaultValue={task.description}
              onBlur={(e) => handleField('description', e.target.value)}
            />
          </label>

          <Select
            label="Priority"
            value={task.priority}
            onChange={(e) => handleField('priority', e.target.value)}
            options={PRIORITIES.map((p) => ({ value: p, label: p[0].toUpperCase() + p.slice(1) }))}
          />

          <Select
            label="Assignee"
            value={String(task.assigneeId)}
            onChange={(e) => updateTask(task.id, { assigneeId: Number(e.target.value) })}
            options={users.map((u) => ({ value: String(u.id), label: u.name }))}
          />

          <Input
            label="Due date"
            type="date"
            defaultValue={task.dueDate}
            onBlur={(e) => handleField('dueDate', e.target.value)}
          />

          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Comments ({task.comments.length})
            </h3>
            <ul className="flex flex-col gap-2 max-h-40 overflow-y-auto mb-2">
              {task.comments.map((c) => (
                <li key={c.id} className="rounded-md bg-gray-50 dark:bg-gray-800 p-2 text-xs">
                  <p className="font-medium">{c.author}</p>
                  <p className="text-gray-600 dark:text-gray-300">{c.text}</p>
                </li>
              ))}
              {task.comments.length === 0 && (
                <li className="text-xs text-gray-400">No comments yet</li>
              )}
            </ul>
            <form onSubmit={submitComment} className="flex gap-2">
              <label htmlFor="new-comment" className="sr-only">
                Add a comment
              </label>
              <input
                id="new-comment"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment…"
                className="flex-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              />
              <Button type="submit" size="sm">
                Post
              </Button>
            </form>
          </div>

          <Button variant="danger" size="sm" onClick={() => onDeleteRequest(task)} className="self-start">
            Delete task
          </Button>
        </div>
      </aside>
    </div>
  );
}
