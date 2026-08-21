import { useEffect } from 'react';
import clsx from 'clsx';
import { useToast } from '../../hooks/useToast';
import type { ToastVariant } from '../../types';

const variantClasses: Record<ToastVariant, string> = {
  success: 'bg-green-600',
  error: 'bg-red-600',
  info: 'bg-gray-800',
  warning: 'bg-amber-600',
};

function ToastItem({ id, message, variant }: { id: string; message: string; variant: ToastVariant }) {
  const { dismiss } = useToast();

  useEffect(() => {
    const timer = setTimeout(() => dismiss(id), 4000);
    return () => clearTimeout(timer);
  }, [id, dismiss]);

  return (
    <div
      role="status"
      className={clsx(
        'flex items-center justify-between gap-3 rounded-md px-4 py-3 text-sm text-white shadow-lg animate-slide-in',
        variantClasses[variant]
      )}
    >
      <span>{message}</span>
      <button
        onClick={() => dismiss(id)}
        aria-label="Dismiss notification"
        className="text-white/80 hover:text-white"
      >
        ✕
      </button>
    </div>
  );
}

export function ToastContainer() {
  const { toasts } = useToast();

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-80 max-w-[calc(100vw-2rem)]"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} id={t.id} message={t.message} variant={t.variant} />
      ))}
    </div>
  );
}
