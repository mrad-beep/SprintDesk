import clsx from 'clsx';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circle' | 'rect';
}

export function Skeleton({ className, variant = 'rect' }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={clsx(
        'animate-pulse bg-gray-200 dark:bg-gray-700',
        variant === 'circle' && 'rounded-full',
        variant === 'text' && 'rounded h-4',
        variant === 'rect' && 'rounded-md',
        className
      )}
    />
  );
}
