import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "sqlite",
  schema: "./src/features/*/repo/table.ts",
  out: "./drizzle/migrations",
});
