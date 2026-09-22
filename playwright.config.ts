import { defineConfig, devices } from "@playwright/test";

const port = process.env.PORT ?? "3000";
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30_000,
  expect: { timeout: 10_000 },
  use: { baseURL, trace: "retain-on-failure" },
  webServer: { command: `COREPACK_HOME=.corepack corepack pnpm build && rm -rf .next/standalone/.next/static .next/standalone/public && mkdir -p .next/standalone/.next && cp -R .next/static .next/standalone/.next/static && cp -R public .next/standalone/public && cd .next/standalone && HOSTNAME=127.0.0.1 PORT=${port} node server.js`, url: baseURL, reuseExistingServer: process.env.PLAYWRIGHT_REUSE_SERVER === "true" && !process.env.CI, timeout: 120_000 },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } }
  ]
});
