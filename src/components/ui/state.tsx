import { AlertTriangle, Loader2, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function LoadingState({ label = "Loading" }: { label?: string }) {
  return <div className="flex min-h-36 items-center justify-center gap-2 text-sm text-slate-600" role="status"><Loader2 className="h-4 w-4 animate-spin" aria-hidden />{label}</div>;
}

export function EmptyState({ title = "No results", message = "Try adjusting your search or filters." }: { title?: string; message?: string }) {
  return <Card className="flex min-h-36 flex-col items-center justify-center text-center"><SearchX className="mb-3 h-8 w-8 text-slate-400" aria-hidden /><h2 className="text-base font-semibold">{title}</h2><p className="mt-1 text-sm text-slate-600">{message}</p></Card>;
}

export function ErrorState({ title = "Something went wrong", message = "Please try again.", onRetry }: { title?: string; message?: string; onRetry?: () => void }) {
  return <Card className="border-red-200 bg-red-50"><div className="flex gap-3"><AlertTriangle className="mt-0.5 h-5 w-5 text-red-700" aria-hidden /><div><h2 className="font-semibold text-red-950">{title}</h2><p className="mt-1 text-sm text-red-800">{message}</p>{onRetry ? <Button className="mt-4" variant="secondary" onClick={onRetry}>Retry</Button> : null}</div></div></Card>;
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-slate-200 ${className}`} />;
}
