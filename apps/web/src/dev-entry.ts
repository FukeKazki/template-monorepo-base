import { worker } from "@/lib/msw/browser";

await worker.start({ onUnhandledRequest: "bypass" });
await import("@/main");
