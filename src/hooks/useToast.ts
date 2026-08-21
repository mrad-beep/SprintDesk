import { useCallback } from 'react';
import { useToastStore } from '../store/toastStore';
import type { ToastVariant } from '../types';

// Thin, testable hook around the toast store — components call useToast()
// instead of touching the store directly.
export function useToast() {
  const push = useToastStore((s) => s.push);
  const dismiss = useToastStore((s) => s.dismiss);
  const toasts = useToastStore((s) => s.toasts);

  const showToast = useCallback(
    (message: string, variant: ToastVariant = 'info') => push(message, variant),
    [push]
  );

  return { toasts, showToast, dismiss };
}
