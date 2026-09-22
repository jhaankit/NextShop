import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_APP_NAME: z.string().default("Retailer Portal"),
  NEXT_PUBLIC_API_URL: z.string().default(""),
  NEXT_PUBLIC_ENVIRONMENT: z.enum(["development", "test", "staging", "production"]).default("development"),
  NEXT_PUBLIC_ENABLE_MSW: z.enum(["true", "false"]).default("false"),
  AUTH_ISSUER: z.string().default("mock"),
  AUTH_CLIENT_ID: z.string().default("retailer-portal"),
  AUTH_CLIENT_SECRET: z.string().default("development-only"),
  MOCK_AUTH_PASSWORD: z.string().default("password"),
  SESSION_COOKIE_NAME: z.string().default("retailer_session"),
  SESSION_TTL_SECONDS: z.coerce.number().int().positive().default(3600),
  GOOGLE_MAPS_BROWSER_API_KEY: z.string().default(""),
  GOOGLE_MAPS_MAP_ID: z.string().default("DEMO_MAP_ID"),
  GOOGLE_GEOCODING_API_KEY: z.string().default("")
});

export const env = envSchema.parse(process.env);
if (env.NEXT_PUBLIC_ENVIRONMENT === "production" && env.AUTH_CLIENT_SECRET === "development-only") {
  throw new Error("AUTH_CLIENT_SECRET must be configured for production.");
}
export const isMockingEnabled = env.NEXT_PUBLIC_ENABLE_MSW === "true";
