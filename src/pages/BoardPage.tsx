import { KanbanBoard } from '../components/board/KanbanBoard';

export function BoardPage() {
  return (
    <div>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-4">
        <h1 className="text-xl font-semibold">Sprint Board</h1>
        <p className="text-sm text-gray-500">Drag tasks between columns to update their status.</p>
      </div>
      <KanbanBoard />
    </div>
  );
}
