"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({ defaultOptions: { queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: false } } }));
  return <QueryClientProvider client={queryClient}><SessionExpiryRedirect />{children}</QueryClientProvider>;
}

function SessionExpiryRedirect() {
  const router = useRouter();
  useEffect(() => {
    const onExpired = () => router.push("/login?reason=expired");
    window.addEventListener("portal:session-expired", onExpired);
    return () => window.removeEventListener("portal:session-expired", onExpired);
  }, [router]);
  return null;
}
