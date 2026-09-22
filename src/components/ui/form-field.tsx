import { cn } from "@/lib/utils";

export function Field({ label, htmlFor, error, children }: { label: string; htmlFor?: string; error?: string; children: React.ReactNode }) {
  return <div className="grid gap-1"><label className="text-sm font-medium text-slate-700" htmlFor={htmlFor}>{label}</label>{children}{error ? <p className="text-sm text-red-700" role="alert">{error}</p> : null}</div>;
}

export function Fieldset({ legend, description, className, children }: { legend: string; description?: string; className?: string; children: React.ReactNode }) {
  return <fieldset className={cn("rounded-xl border border-slate-200 p-4", className)}><legend className="px-1 text-sm font-semibold text-slate-900">{legend}</legend>{description ? <p className="mb-3 text-sm text-slate-600">{description}</p> : null}{children}</fieldset>;
}
