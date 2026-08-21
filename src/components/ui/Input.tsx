import { forwardRef, useId, type InputHTMLAttributes } from 'react';
import clsx from 'clsx';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, id, className, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const hintId = hint ? `${inputId}-hint` : undefined;
    const errorId = error ? `${inputId}-error` : undefined;

    return (
      <div className="flex flex-col gap-1">
        <label htmlFor={inputId} className="text-sm font-medium text-gray-700 dark:text-gray-200">
          {label}
        </label>
        <input
          ref={ref}
          id={inputId}
          aria-invalid={!!error}
          aria-describedby={clsx(hintId, errorId) || undefined}
          className={clsx(
            'rounded-md border px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-gray-100',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
            error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600',
            className
          )}
          {...props}
        />
        {hint && !error && (
          <span id={hintId} className="text-xs text-gray-500 dark:text-gray-400">
            {hint}
          </span>
        )}
        {error && (
          <span id={errorId} role="alert" className="text-xs text-red-600">
            {error}
          </span>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';
