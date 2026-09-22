import { EmptyState, ErrorState, LoadingState } from "@/components/ui/state";

export function QueryState<T>({ isLoading, error, data, empty, children, onRetry }: { isLoading: boolean; error: Error | null; data: T | undefined; empty?: boolean; children: (data: T) => React.ReactNode; onRetry?: () => void }) {
  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message={error.message} onRetry={onRetry} />;
  if (!data || empty) return <EmptyState />;
  return <>{children(data)}</>;
}
