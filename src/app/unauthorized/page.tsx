import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function UnauthorizedPage() {
  return <main className="grid min-h-screen place-items-center p-6"><section className="max-w-lg rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm"><ShieldAlert className="mx-auto h-10 w-10 text-amber-600" aria-hidden /><h1 className="mt-4 text-2xl font-bold">Access restricted</h1><p className="mt-3 text-slate-600">Your current role does not include permission for this workflow. Contact an account administrator if your responsibilities changed.</p><Button asChild className="mt-6"><Link href="/dashboard">Go to dashboard</Link></Button></section></main>;
}
