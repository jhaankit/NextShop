import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return <main className="grid min-h-screen place-items-center p-6"><div className="max-w-md text-center"><p className="text-sm font-semibold text-teal-700">404</p><h1 className="mt-2 text-3xl font-bold">Page not found</h1><p className="mt-3 text-slate-600">The page may have moved or you may not have access to it.</p><Button asChild className="mt-6"><Link href="/dashboard">Return to dashboard</Link></Button></div></main>;
}
