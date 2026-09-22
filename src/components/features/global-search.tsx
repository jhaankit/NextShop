"use client";

import Link from "next/link";
import * as Dialog from "@radix-ui/react-dialog";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EmptyState, LoadingState } from "@/components/ui/state";
import { useDebounce } from "@/hooks/use-debounce";
import { productsService } from "@/services/products/client";

export function GlobalSearch({ trigger }: { trigger: React.ReactNode }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [recent, setRecent] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    return JSON.parse(window.localStorage.getItem("recent-searches") ?? "[]") as string[];
  });
  const debounced = useDebounce(query, 250);
  const contentId = useMemo(() => "global-search-results", []);
  const suggestions = useQuery({
    queryKey: ["global-search", debounced],
    queryFn: () => productsService.getSuggestions(debounced),
    enabled: debounced.trim().length > 0
  });

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function remember(value: string) {
    if (!value.trim()) return;
    const next = [value, ...recent.filter((item) => item !== value)].slice(0, 5);
    setRecent(next);
    window.localStorage.setItem("recent-searches", JSON.stringify(next));
  }

  const results = debounced.trim() ? suggestions.data ?? [] : [];
  const activeResult = results[activeIndex];

  function onSearchKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((current) => Math.min(current + 1, Math.max(results.length - 1, 0)));
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) => Math.max(current - 1, 0));
    }
    if (event.key === "Enter" && activeResult) {
      event.preventDefault();
      remember(query);
      setOpen(false);
      router.push(activeResult.href);
    }
  }

  return <Dialog.Root open={open} onOpenChange={setOpen}><Dialog.Trigger asChild>{trigger}</Dialog.Trigger><Dialog.Portal><Dialog.Overlay className="fixed inset-0 z-40 bg-slate-950/50" /><Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[calc(100vw-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-auto rounded-xl bg-white p-6 shadow-xl"><div className="mb-4 flex items-center justify-between gap-4"><Dialog.Title className="text-lg font-semibold">Search portal</Dialog.Title><Dialog.Close asChild><Button variant="ghost" size="sm" aria-label="Close search"><X className="h-4 w-4" /></Button></Dialog.Close></div><div className="space-y-4"><div className="relative"><Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" /><Input className="pl-9 pr-10" value={query} onChange={(event) => { setQuery(event.target.value); setActiveIndex(0); }} onKeyDown={onSearchKeyDown} aria-controls={contentId} aria-activedescendant={activeResult ? `search-option-${activeResult.id}` : undefined} placeholder="Search SKU, product, order, invoice" autoFocus />{query ? <Button type="button" variant="ghost" size="sm" className="absolute right-1 top-1" onClick={() => setQuery("")} aria-label="Clear search"><X className="h-4 w-4" /></Button> : null}</div><div id={contentId} className="min-h-32" role="listbox" aria-label="Search suggestions">{suggestions.isLoading ? <LoadingState label="Searching" /> : query && results.length === 0 ? <EmptyState title="No matches" message="Try a SKU, order number, invoice number, or category." /> : results.length ? <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200">{results.map((result, index) => <li id={`search-option-${result.id}`} role="option" aria-selected={index === activeIndex} key={result.id}><Link className={`block px-3 py-2 text-sm hover:bg-slate-50 ${index === activeIndex ? "bg-teal-50 text-teal-900" : ""}`} href={result.href} onClick={() => { remember(query); setOpen(false); }}>{result.label}</Link></li>)}</ul> : <div><p className="text-sm font-medium text-slate-700">Recent searches</p><div className="mt-2 flex flex-wrap gap-2">{recent.length ? recent.map((item) => <button key={item} className="rounded-full bg-slate-100 px-3 py-1 text-sm" onClick={() => setQuery(item)}>{item}</button>) : <span className="text-sm text-slate-500">No recent searches yet.</span>}</div></div>}</div></div></Dialog.Content></Dialog.Portal></Dialog.Root>;
}
