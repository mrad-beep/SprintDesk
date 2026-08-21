export function FullScreenLoader() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-gray-50 dark:bg-gray-900" role="status" aria-live="polite">
      <div className="flex flex-col items-center gap-3">
        <span className="h-10 w-10 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" aria-hidden="true" />
        <p className="text-sm text-gray-500 dark:text-gray-400">Validating your session…</p>
      </div>
    </div>
  );
}
