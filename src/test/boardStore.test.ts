import { describe, it, expect, beforeEach } from 'vitest';
import { useBoardStore } from '../store/boardStore';
import type { Task } from '../types';

const sampleTasks: Task[] = [
  { id: 1, title: 'A', description: '', status: 'backlog', priority: 'low', assigneeId: 1, dueDate: '2026-09-01', sprint: 'S1', createdAt: '', comments: [] },
  { id: 2, title: 'B', description: '', status: 'backlog', priority: 'medium', assigneeId: 1, dueDate: '2026-09-02', sprint: 'S1', createdAt: '', comments: [] },
  { id: 3, title: 'C', description: '', status: 'in_progress', priority: 'high', assigneeId: 2, dueDate: '2026-09-03', sprint: 'S1', createdAt: '', comments: [] },
];

describe('boardStore', () => {
  beforeEach(() => {
    useBoardStore.setState({ tasks: JSON.parse(JSON.stringify(sampleTasks)), lastMove: null, hydrated: true });
  });

  it('adds a new task to the front of the list', () => {
    useBoardStore.getState().addTask({
      title: 'New task', description: '', status: 'backlog', priority: 'high', assigneeId: 1, dueDate: '2026-09-10', sprint: 'S1',
    });
    const tasks = useBoardStore.getState().tasks;
    expect(tasks).toHaveLength(4);
    expect(tasks[0].title).toBe('New task');
    expect(tasks[0].id).toBeDefined();
    expect(tasks[0].comments).toEqual([]);
  });

  it('moves a task between columns', () => {
    useBoardStore.getState().moveTask(1, 'in_progress', 0);
    const task = useBoardStore.getState().tasks.find((t) => t.id === 1);
    expect(task?.status).toBe('in_progress');
  });

  it('reorders a task within the same column', () => {
    useBoardStore.getState().moveTask(2, 'backlog', 0);
    const backlog = useBoardStore.getState().tasksByStatus('backlog');
    expect(backlog[0].id).toBe(2);
    expect(backlog[1].id).toBe(1);
  });

  it('records lastMove for undo and restores prior position', () => {
    useBoardStore.getState().moveTask(1, 'done', 0);
    expect(useBoardStore.getState().lastMove).toMatchObject({ taskId: 1, toStatus: 'done' });
    useBoardStore.getState().undoLastMove();
    const task = useBoardStore.getState().tasks.find((t) => t.id === 1);
    expect(task?.status).toBe('backlog');
  });

  it('deletes a task', () => {
    useBoardStore.getState().deleteTask(3);
    expect(useBoardStore.getState().tasks.find((t) => t.id === 3)).toBeUndefined();
    expect(useBoardStore.getState().tasks).toHaveLength(2);
  });

  it('adds a comment to a task', () => {
    useBoardStore.getState().addComment(1, { id: 99, author: 'You', text: 'hi', createdAt: 'now' });
    const task = useBoardStore.getState().tasks.find((t) => t.id === 1);
    expect(task?.comments).toHaveLength(1);
    expect(task?.comments[0].text).toBe('hi');
  });
});
