import { Suspense } from "react";
import { LoginForm } from "@/components/features/login-form";

export default function LoginPage() {
  return <main className="grid min-h-screen place-items-center bg-slate-100 p-6"><section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm"><p className="text-sm font-semibold text-teal-700">Enterprise B2B portal</p><h1 className="mt-2 text-3xl font-bold tracking-tight">Sign in to Retailer Portal</h1><p className="mt-2 text-sm text-slate-600">Access ordering, invoices, locations, users, and support from a secure account workspace.</p><div className="mt-8"><Suspense><LoginForm /></Suspense></div></section></main>;
}
