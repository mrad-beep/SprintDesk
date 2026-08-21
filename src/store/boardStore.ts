import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ColumnId, Comment, Priority, Task } from '../types';

interface MoveRecord {
  taskId: number;
  fromStatus: ColumnId;
  fromIndex: number;
  toStatus: ColumnId;
  toIndex: number;
}

interface BoardState {
  tasks: Task[];
  lastMove: MoveRecord | null;
  hydrated: boolean;
  hydrate: (tasks: Task[]) => void;
  moveTask: (taskId: number, toStatus: ColumnId, toIndex: number) => void;
  undoLastMove: () => void;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'comments'>) => void;
  deleteTask: (taskId: number) => void;
  updateTask: (taskId: number, updates: Partial<Task>) => void;
  addComment: (taskId: number, comment: Comment) => void;
  tasksByStatus: (status: ColumnId) => Task[];
}

export const useBoardStore = create<BoardState>()(
  persist(
    (set, get) => ({
      tasks: [],
      lastMove: null,
      hydrated: false,
      hydrate: (tasks) =>
        set((state) => (state.hydrated ? state : { tasks, hydrated: true })),

      moveTask: (taskId, toStatus, toIndex) => {
        const { tasks } = get();
        const task = tasks.find((t) => t.id === taskId);
        if (!task) return;

        const fromStatus = task.status;
        const columnTasksBefore = tasks.filter((t) => t.status === fromStatus);
        const fromIndex = columnTasksBefore.findIndex((t) => t.id === taskId);

        const withoutTask = tasks.filter((t) => t.id !== taskId);
        const destColumn = withoutTask.filter((t) => t.status === toStatus);
        const rest = withoutTask.filter((t) => t.status !== toStatus);

        const clampedIndex = Math.max(0, Math.min(toIndex, destColumn.length));
        const updatedTask = { ...task, status: toStatus };
        const newDestColumn = [
          ...destColumn.slice(0, clampedIndex),
          updatedTask,
          ...destColumn.slice(clampedIndex),
        ];

        set({
          tasks: [...rest, ...newDestColumn],
          lastMove: { taskId, fromStatus, fromIndex, toStatus, toIndex: clampedIndex },
        });
      },

      undoLastMove: () => {
        const { lastMove } = get();
        if (!lastMove) return;
        get().moveTask(lastMove.taskId, lastMove.fromStatus, lastMove.fromIndex);
        set({ lastMove: null });
      },

      addTask: (task) =>
        set((state) => ({
          tasks: [
            {
              ...task,
              id: Date.now(),
              createdAt: new Date().toISOString(),
              comments: [],
            },
            ...state.tasks,
          ],
        })),

      deleteTask: (taskId) =>
        set((state) => ({ tasks: state.tasks.filter((t) => t.id !== taskId) })),

      updateTask: (taskId, updates) =>
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === taskId ? { ...t, ...updates } : t)),
        })),

      addComment: (taskId, comment) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId ? { ...t, comments: [...t.comments, comment] } : t
          ),
        })),

      tasksByStatus: (status) => get().tasks.filter((t) => t.status === status),
    }),
    { name: 'sprintdesk-board' }
  )
);

export const PRIORITIES: Priority[] = ['low', 'medium', 'high'];
export const COLUMNS: { id: ColumnId; label: string }[] = [
  { id: 'backlog', label: 'Backlog' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'review', label: 'Review' },
  { id: 'done', label: 'Done' },
];
