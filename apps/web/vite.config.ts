import path from "node:path";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import { playwright } from "@vitest/browser-playwright";
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
  server: {
    // USE_MOCK=false でMSWを止めたときに /api を apps/api のローカルWorkerへ転送する。
    // apps/api はルート直下 (/products) にエンドポイントを持つため /api を剥がす。
    // MSW有効時はService Workerがブラウザ側で先に握るのでこのproxyには届かない。
    proxy: {
      "/api": {
        target: process.env["VITE_API_PROXY_TARGET"] ?? "http://localhost:8787",
        changeOrigin: true,
        rewrite: (requestPath) => requestPath.replace(/^\/api/, ""),
      },
    },
  },
  test: {
    // unit: 純粋なロジック(*.spec.ts等)をNode/jsdomで高速に検証するプロジェクト
    // storybook: Storyをそのままvitestのテストとして実ブラウザ(Chromium)で検証するプロジェクト
    projects: [
      {
        // extends: true でルートのplugins/resolveなどの設定を継承する
        extends: true,
        test: {
          name: "unit",
          setupFiles: ["./src/test/setup.ts"],
        },
      },
      {
        extends: true,
        // Story定義とplay関数をvitestのテストケースとして実行できるようにするプラグイン
        plugins: [storybookTest({ configDir: path.resolve(import.meta.dirname, ".storybook") })],
        // 初回実行時にViteの依存最適化が走り直してテストが不安定になるのを防ぐため事前に含めておく
        optimizeDeps: {
          include: ["msw-storybook-addon/csf3"],
        },
        test: {
          name: "storybook",
          // jsdomではなくPlaywright経由の実Chromiumでレンダリング・play関数を実行する
          browser: {
            enabled: true,
            provider: playwright(),
            instances: [{ browser: "chromium" }],
          },
        },
      },
    ],
  },
});
