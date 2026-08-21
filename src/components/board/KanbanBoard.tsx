import { useMemo, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useBoardStore, COLUMNS } from '../../store/boardStore';
import { useTasksQuery, useUsersQuery } from '../../hooks/useTasksQuery';
import { Column } from './Column';
import { TaskCard } from './TaskCard';
import { TaskDrawer } from './TaskDrawer';
import { AddTaskModal } from './AddTaskModal';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { Skeleton } from '../ui/Skeleton';
import { useToast } from '../../hooks/useToast';
import type { ColumnId, Task } from '../../types';

export function KanbanBoard() {
  const { isLoading, isError } = useTasksQuery();
  const { data: users = [] } = useUsersQuery();
  const tasks = useBoardStore((s) => s.tasks);
  const moveTask = useBoardStore((s) => s.moveTask);
  const undoLastMove = useBoardStore((s) => s.undoLastMove);
  const lastMove = useBoardStore((s) => s.lastMove);
  const deleteTask = useBoardStore((s) => s.deleteTask);
  const { showToast } = useToast();

  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [openTask, setOpenTask] = useState<Task | null>(null);
  const [taskPendingDelete, setTaskPendingDelete] = useState<Task | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const filteredTasks = useMemo(
    () =>
      tasks.filter(
        (t) =>
          (priorityFilter === 'all' || t.priority === priorityFilter) &&
          (assigneeFilter === 'all' || String(t.assigneeId) === assigneeFilter)
      ),
    [tasks, priorityFilter, assigneeFilter]
  );

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id);
    setActiveTask(task ?? null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);
    if (!over) return;

    const activeTaskItem = tasks.find((t) => t.id === active.id);
    if (!activeTaskItem) return;

    const overColumn = COLUMNS.find((c) => c.id === over.id);
    const overTask = tasks.find((t) => t.id === over.id);

    let targetStatus: ColumnId;
    let targetIndex: number;

    if (overColumn) {
      targetStatus = overColumn.id;
      targetIndex = tasks.filter((t) => t.status === overColumn.id).length;
    } else if (overTask) {
      targetStatus = overTask.status;
      targetIndex = tasks.filter((t) => t.status === overTask.status).findIndex((t) => t.id === overTask.id);
    } else {
      return;
    }

    if (activeTaskItem.status === targetStatus && activeTaskItem.id === over.id) return;
    moveTask(activeTaskItem.id, targetStatus, targetIndex);
  };

  if (isLoading) {
    return (
      <div className="flex gap-4 overflow-x-auto p-4">
        {COLUMNS.map((c) => (
          <div key={c.id} className="w-72 shrink-0 space-y-2">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return <p className="p-6 text-sm text-red-600">Failed to load sprint data. Please refresh.</p>;
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-wrap gap-3">
          <Select
            label="Priority"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All priorities' },
              { value: 'low', label: 'Low' },
              { value: 'medium', label: 'Medium' },
              { value: 'high', label: 'High' },
            ]}
          />
          <Select
            label="Assignee"
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
            options={[{ value: 'all', label: 'All assignees' }, ...users.map((u) => ({ value: String(u.id), label: u.name }))]}
          />
        </div>
        <div className="flex gap-2">
          {lastMove && (
            <Button variant="secondary" size="sm" onClick={undoLastMove}>
              Undo last move
            </Button>
          )}
          <Button size="sm" onClick={() => setShowAddModal(true)}>
            + Add task
          </Button>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {COLUMNS.map((col) => (
            <Column
              key={col.id}
              id={col.id}
              label={col.label}
              tasks={filteredTasks.filter((t) => t.status === col.id)}
              users={users}
              onOpenTask={setOpenTask}
            />
          ))}
        </div>
        <DragOverlay>
          {activeTask ? (
            <TaskCard task={activeTask} assignee={users.find((u) => u.id === activeTask.assigneeId)} onOpen={() => {}} />
          ) : null}
        </DragOverlay>
      </DndContext>

      <TaskDrawer
        task={openTask}
        users={users}
        onClose={() => setOpenTask(null)}
        onDeleteRequest={(task) => setTaskPendingDelete(task)}
      />

      <AddTaskModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} users={users} />

      <Modal
        isOpen={!!taskPendingDelete}
        onClose={() => setTaskPendingDelete(null)}
        title="Delete task?"
        footer={
          <>
            <Button variant="secondary" onClick={() => setTaskPendingDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                if (taskPendingDelete) {
                  deleteTask(taskPendingDelete.id);
                  showToast('Task deleted', 'success');
                }
                setTaskPendingDelete(null);
                setOpenTask(null);
              }}
            >
              Delete
            </Button>
          </>
        }
      >
        <p>
          This will permanently remove "<strong>{taskPendingDelete?.title}</strong>" from the board.
        </p>
      </Modal>
    </div>
  );
}
