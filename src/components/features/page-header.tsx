export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: React.ReactNode }) {
  return <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><h1 className="text-2xl font-bold tracking-tight text-slate-950">{title}</h1>{description ? <p className="mt-1 text-sm text-slate-600">{description}</p> : null}</div>{actions}</div>;
}
