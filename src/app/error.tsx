"use client";
import { ErrorState } from "@/components/ui/state";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return <main className="p-6"><ErrorState title="Portal error" message="The portal could not render this page safely." onRetry={reset} /></main>;
}
