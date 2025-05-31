import { defineConfig } from "@playwright/test";

export default defineConfig({
  timeout: 2_000,
  expect: { timeout: 2_000 },
});
