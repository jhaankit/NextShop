import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const variants = cva("inline-flex items-center justify-center gap-2 rounded-md text-sm font-semibold transition-colors disabled:pointer-events-none disabled:opacity-50", {
  variants: {
    variant: {
      primary: "bg-teal-700 text-white hover:bg-teal-800",
      secondary: "border border-slate-300 bg-white text-slate-900 hover:bg-slate-50",
      ghost: "text-slate-700 hover:bg-slate-100",
      danger: "bg-red-700 text-white hover:bg-red-800"
    },
    size: { sm: "h-8 px-3", md: "h-10 px-4", lg: "h-12 px-5" }
  },
  defaultVariants: { variant: "primary", size: "md" }
});

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof variants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, asChild, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";
  return <Comp ref={ref} className={cn(variants({ variant, size }), className)} {...props} />;
});
Button.displayName = "Button";
