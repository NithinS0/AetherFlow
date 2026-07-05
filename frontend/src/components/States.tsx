import { AlertTriangle, RefreshCw } from "lucide-react";

interface SkeletonProps {
  count?: number;
  heightClass?: string;
}

export function SkeletonLoader({ count = 3, heightClass = "h-8" }: SkeletonProps) {
  return (
    <div className="w-full space-y-3 animate-pulse">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className={`w-full bg-zinc-800/60 rounded-lg ${heightClass}`} />
      ))}
    </div>
  );
}

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
}

export function EmptyState({
  title = "No results found",
  description = "Try adjusting your search criteria or add new items.",
  icon,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-border rounded-2xl bg-zinc-900/5">
      {icon ? (
        <div className="p-3 bg-zinc-900 border border-border rounded-xl text-zinc-500 mb-4">
          {icon}
        </div>
      ) : null}
      <h3 className="text-sm font-bold text-zinc-300">{title}</h3>
      <p className="text-[11px] text-zinc-500 mt-1 max-w-xs leading-normal">
        {description}
      </p>
    </div>
  );
}

interface ErrorStateProps {
  error?: string;
  onRetry?: () => void;
}

export function ErrorState({ error = "System error occurred.", onRetry }: ErrorStateProps) {
  return (
    <div className="p-6 rounded-2xl bg-red-950/15 border border-red-900/30 text-center space-y-4">
      <AlertTriangle className="w-8 h-8 text-red-500 mx-auto" />
      <div>
        <h4 className="text-sm font-bold text-red-400">Execution Error</h4>
        <p className="text-[11px] text-red-500 mt-1">{error}</p>
      </div>
      {onRetry ? (
        <button
          onClick={onRetry}
          className="px-3.5 py-1.5 bg-red-900/30 hover:bg-red-900/50 border border-red-800/40 text-red-300 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Try again
        </button>
      ) : null}
    </div>
  );
}

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = "Gathering telemetry data..." }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center space-y-3">
      <span className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      <span className="text-xs text-zinc-500 font-medium font-mono">{message}</span>
    </div>
  );
}
