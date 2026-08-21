import { forwardRef, useId, type SelectHTMLAttributes } from 'react';
import clsx from 'clsx';

interface Option {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: Option[];
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, error, id, className, ...props }, ref) => {
    const generatedId = useId();
    const selectId = id ?? generatedId;

    return (
      <div className="flex flex-col gap-1">
        <label htmlFor={selectId} className="text-sm font-medium text-gray-700 dark:text-gray-200">
          {label}
        </label>
        <select
          ref={ref}
          id={selectId}
          aria-invalid={!!error}
          className={clsx(
            'rounded-md border px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-gray-100',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
            error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600',
            className
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && (
          <span role="alert" className="text-xs text-red-600">
            {error}
          </span>
        )}
      </div>
    );
  }
);
Select.displayName = 'Select';
