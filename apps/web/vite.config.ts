import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [
    tanstackRouter({ target: "react", autoCodeSplitting: true, routesDirectory: "./src/routes" }),
    react(),
    tailwindcss(),
    {
      name: "dev-entry",
      apply: "serve",
      transformIndexHtml: (html) =>
        process.env["USE_MOCK"] === "false"
          ? html
          : html.replace("/src/main.tsx", "/src/dev-entry.ts"),
    },
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  test: {
    setupFiles: ["./src/test/setup.ts"],
  },
});
