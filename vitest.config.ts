import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/unit/**/*.test.ts", "tests/integration/**/*.test.ts"],
    environment: "node",
    globals: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      reportsDirectory: "coverage",
      include: ["tests/unit/**/*.test.ts", "tests/integration/**/*.test.ts"],
      exclude: [
        "tests/e2e/**",
        "**/*.d.ts",
        "**/node_modules/**",
        "**/dist/**",
        "**/build/**",
        "playwright.config.ts",
        "vitest.config.ts"
      ],
      thresholds: {
        lines: 85,
        functions: 85,
        statements: 85,
        branches: 80
      }
    }
  }
});
