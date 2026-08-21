import { useState, type FormEvent } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { useBoardStore, PRIORITIES, COLUMNS } from '../../store/boardStore';
import { useToast } from '../../hooks/useToast';
import type { ColumnId, Priority, User } from '../../types';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  defaultStatus?: ColumnId;
}

export function AddTaskModal({ isOpen, onClose, users, defaultStatus = 'backlog' }: AddTaskModalProps) {
  const addTask = useBoardStore((s) => s.addTask);
  const { showToast } = useToast();
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [assigneeId, setAssigneeId] = useState(users[0]?.id ?? 1);
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState<ColumnId>(defaultStatus);
  const [error, setError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required.');
      return;
    }
    if (!dueDate) {
      setError('Due date is required.');
      return;
    }
    addTask({
      title: title.trim(),
      description: '',
      status,
      priority,
      assigneeId,
      dueDate,
      sprint: 'Sprint 12',
    });
    showToast('Task created', 'success');
    setTitle('');
    setDueDate('');
    setError('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add new task">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} error={error && !title ? error : undefined} />
        <Select
          label="Column"
          value={status}
          onChange={(e) => setStatus(e.target.value as ColumnId)}
          options={COLUMNS.map((c) => ({ value: c.id, label: c.label }))}
        />
        <Select
          label="Priority"
          value={priority}
          onChange={(e) => setPriority(e.target.value as Priority)}
          options={PRIORITIES.map((p) => ({ value: p, label: p[0].toUpperCase() + p.slice(1) }))}
        />
        <Select
          label="Assignee"
          value={String(assigneeId)}
          onChange={(e) => setAssigneeId(Number(e.target.value))}
          options={users.map((u) => ({ value: String(u.id), label: u.name }))}
        />
        <Input
          label="Due date"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          error={error && !dueDate ? error : undefined}
        />
        <div className="flex justify-end gap-2 mt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Create task</Button>
        </div>
      </form>
    </Modal>
  );
}
