import { cleanup } from "@testing-library/react";
import { afterAll, afterEach, beforeAll } from "vitest";
import "@testing-library/jest-dom/vitest";
import { server } from "@/lib/msw/node";

beforeAll(() => {
  server.listen({ onUnhandledRequest: "error" });
});

afterEach(() => {
  cleanup();
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});
