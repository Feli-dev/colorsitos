import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

// Recent Node versions ship a global `localStorage` that shadows jsdom's,
// breaking tests that touch storage. Older Node rejects the flag, so pass it
// only when this runtime knows it.
const WEBSTORAGE_FLAG = "--no-experimental-webstorage";
const execArgv = process.allowedNodeEnvironmentFlags.has(WEBSTORAGE_FLAG)
  ? [WEBSTORAGE_FLAG]
  : [];

export default defineConfig({
  plugins: [react()],
  resolve: {
    // Resolves the `@/*` alias straight from tsconfig.json so tests import
    // modules exactly the way application code does.
    tsconfigPaths: true,
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    restoreMocks: true,
    execArgv,
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      reportsDirectory: "./coverage",
      include: ["src/utils/**", "src/lib/**", "src/hooks/**"],
    },
  },
});
