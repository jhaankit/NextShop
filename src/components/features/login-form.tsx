"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Field } from "@/components/ui/form-field";
import { loginSchema, passwordResetSchema, type LoginInput, type PasswordResetInput } from "@/schemas/forms";
import { authService } from "@/services/auth/client";

export function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const [error, setError] = useState<string>();
  const [showPassword, setShowPassword] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [resetMessage, setResetMessage] = useState<string>();
  const form = useForm<LoginInput>({ resolver: zodResolver(loginSchema), defaultValues: { email: "admin@example.com", password: "password" } });
  const resetForm = useForm<PasswordResetInput>({ resolver: zodResolver(passwordResetSchema), defaultValues: { email: "", relationship: "retailer" } });

  async function onSubmit(values: LoginInput) {
    setError(undefined);
    try {
      await authService.login(values);
      router.push(search.get("next") ?? "/dashboard");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to sign in");
    }
  }

  async function onReset(values: PasswordResetInput) {
    setResetMessage(undefined);
    setError(undefined);
    try {
      const result = await authService.requestPasswordReset(values);
      setResetMessage(result.message);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to request password reset");
    }
  }

  return <div className="space-y-6"><form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)} noValidate><Field label="Email" htmlFor="email" error={form.formState.errors.email?.message}><Input id="email" type="email" autoComplete="email" aria-invalid={Boolean(form.formState.errors.email)} {...form.register("email")} /></Field><Field label="Password" htmlFor="password" error={form.formState.errors.password?.message}><div className="flex gap-2"><Input id="password" type={showPassword ? "text" : "password"} autoComplete="current-password" aria-invalid={Boolean(form.formState.errors.password)} {...form.register("password")} /><Button type="button" variant="secondary" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword((value) => !value)}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</Button></div></Field>{search.get("reason") === "expired" ? <p className="rounded-md bg-amber-50 p-3 text-sm text-amber-800" role="status">Your session expired. Sign in again to continue.</p> : null}{error ? <p className="rounded-md bg-red-50 p-3 text-sm text-red-800" role="alert">{error}</p> : null}<Button className="w-full" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? "Signing in..." : "Sign in"}</Button><Button className="w-full" type="button" variant="ghost" onClick={() => setShowReset((value) => !value)}>Forgot your password?</Button><p className="text-xs text-slate-500">Demo users use password <code>password</code>. Try admin@example.com, approver@example.com, buyer@example.com, finance@example.com, or viewer@example.com.</p></form>{showReset ? <form className="space-y-4 border-t border-slate-200 pt-4" onSubmit={resetForm.handleSubmit(onReset)} noValidate><h2 className="text-lg font-semibold">Reset password</h2><Field label="Relationship" htmlFor="relationship" error={resetForm.formState.errors.relationship?.message}><Select id="relationship" {...resetForm.register("relationship")}><option value="retailer">Retailer account</option><option value="national-account">National account</option></Select></Field><Field label="Account email" htmlFor="reset-email" error={resetForm.formState.errors.email?.message}><Input id="reset-email" type="email" autoComplete="email" aria-invalid={Boolean(resetForm.formState.errors.email)} {...resetForm.register("email")} /></Field>{resetMessage ? <p className="rounded-md bg-emerald-50 p-3 text-sm text-emerald-800" role="status">{resetMessage}</p> : null}<Button className="w-full" disabled={resetForm.formState.isSubmitting}>{resetForm.formState.isSubmitting ? "Requesting..." : "Request reset"}</Button></form> : null}</div>;
}
