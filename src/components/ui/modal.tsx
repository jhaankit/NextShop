"use client";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Modal({ title, trigger, children }: { title: string; trigger: React.ReactNode; children: React.ReactNode }) {
  return <Dialog.Root><Dialog.Trigger asChild>{trigger}</Dialog.Trigger><Dialog.Portal><Dialog.Overlay className="fixed inset-0 z-40 bg-slate-950/50" /><Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[calc(100vw-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-auto rounded-xl bg-white p-6 shadow-xl"><div className="mb-4 flex items-center justify-between gap-4"><Dialog.Title className="text-lg font-semibold">{title}</Dialog.Title><Dialog.Close asChild><Button variant="ghost" size="sm" aria-label="Close dialog"><X className="h-4 w-4" /></Button></Dialog.Close></div>{children}</Dialog.Content></Dialog.Portal></Dialog.Root>;
}
