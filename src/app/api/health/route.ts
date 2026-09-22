import { apiJson } from "@/app/api/_lib";
import { env } from "@/config/env";

export function GET() {
  return apiJson({ ok: true, service: "retailer-portal", environment: env.NEXT_PUBLIC_ENVIRONMENT, version: process.env.npm_package_version ?? "0.1.0", checkedAt: new Date().toISOString() });
}
