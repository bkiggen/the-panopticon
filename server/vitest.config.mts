import { defineConfig } from "vitest/config";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["src/**/*.test.ts"],
    exclude: ["node_modules", "src/cron/**/*.test.ts"],
    fileParallelism: false, // Run test files sequentially
    sequence: {
      shuffle: false, // Run tests in order
    },
    env: {
      NODE_ENV: "test", // Set NODE_ENV before any modules load
    },
    coverage: {
      reporter: ["text", "html"],
      exclude: ["node_modules", "src/**/*.test.ts"],
    },
    setupFiles: ["src/test/setup.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
