"use client";

import Link from "next/link";
import * as Popover from "@radix-ui/react-popover";
import { ChevronRight, ClipboardList, PackageCheck, Truck } from "lucide-react";
import { useState } from "react";
import { productNavigation, type ProductNavigation, type ProductNavigationPromo } from "@/config/product-navigation";
import { cn } from "@/lib/utils";

const promoIcons: Record<ProductNavigationPromo["tone"], React.ElementType> = {
  contract: ClipboardList,
  replenishment: Truck
};

export interface SubMenuBtnProps {
  label: string;
  icon: React.ElementType;
  active?: boolean;
  menu?: ProductNavigation;
  onNavigate?: () => void;
  className?: string;
}

export function SubMenuBtn({ label, icon: Icon, active = false, menu = productNavigation, onNavigate, className }: SubMenuBtnProps) {
  const [open, setOpen] = useState(false);

  function handleNavigate() {
    setOpen(false);
    onNavigate?.();
  }

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          className={cn(
            "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors",
            active ? "bg-teal-50 text-teal-900" : "text-slate-700 hover:bg-slate-100",
            open && "bg-slate-100 text-slate-950",
            className
          )}
          aria-label={`${label} menu`}
        >
          <Icon className="h-4 w-4 shrink-0" aria-hidden />
          <span className="min-w-0 flex-1">{label}</span>
          <ChevronRight className={cn("h-4 w-4 shrink-0 transition-transform", open && "rotate-90")} aria-hidden />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          side="right"
          align="start"
          sideOffset={12}
          collisionPadding={16}
          className="z-50 max-h-[calc(100vh-2rem)] w-[min(calc(100vw-20rem),58rem)] overflow-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl"
          aria-label={`${label} submenu`}
          role="region"
        >
          <div className="grid gap-6 lg:grid-cols-[11rem_1fr_13rem]">
            <aside className="space-y-2 border-b border-slate-200 pb-4 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-4">
              <Link
                href={menu.allProducts.href}
                onClick={handleNavigate}
                className="block rounded-lg px-2 py-2 text-sm font-semibold text-slate-950 hover:bg-teal-50 hover:text-teal-900"
              >
                {menu.allProducts.label}
              </Link>
              {menu.allProducts.description ? <p className="px-2 text-xs leading-5 text-slate-500">{menu.allProducts.description}</p> : null}
            </aside>

            <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2 xl:grid-cols-3">
              {menu.sections.map((section) => (
                <section key={section.label} className="min-w-0">
                  <Link
                    href={section.href}
                    onClick={handleNavigate}
                    className="group inline-flex items-center gap-1 text-sm font-bold text-slate-950 hover:text-teal-800"
                  >
                    {section.label}
                    <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
                  </Link>
                  {section.description ? <p className="mt-1 text-xs leading-5 text-slate-500">{section.description}</p> : null}
                  <ul className="mt-3 space-y-2">
                    {section.items.map((item) => (
                      <li key={item.label}>
                        <Link href={item.href} onClick={handleNavigate} className="text-sm text-slate-700 hover:text-teal-800 hover:underline">
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>

            <aside className="grid gap-4 border-t border-slate-200 pt-4 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
              {menu.promos.map((promo) => {
                const PromoIcon = promoIcons[promo.tone] ?? PackageCheck;
                return (
                  <Link
                    key={promo.label}
                    href={promo.href}
                    onClick={handleNavigate}
                    className="group block overflow-hidden rounded-xl border border-slate-200 bg-slate-50 hover:border-teal-200 hover:bg-teal-50"
                  >
                    <span className="grid h-24 place-items-center bg-gradient-to-br from-teal-100 via-slate-100 to-white text-teal-800">
                      <PromoIcon className="h-8 w-8" aria-hidden />
                    </span>
                    <span className="block p-3">
                      <span className="block text-sm font-bold text-slate-950 group-hover:text-teal-900">{promo.label}</span>
                      <span className="mt-1 block text-xs leading-5 text-slate-600">{promo.description}</span>
                    </span>
                  </Link>
                );
              })}
            </aside>
          </div>
          <Popover.Arrow className="fill-white" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
