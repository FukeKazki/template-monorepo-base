import type { AppType } from "@repo/api/app-type";
import { hc } from "hono/client";

// apps/api の型をそのまま受け取るHono RPCクライアント。
// baseUrlは同一オリジンの /api（本番はService Binding、開発はMSWかViteのproxyが受ける）。
export const apiClient = hc<AppType>(
  import.meta.env["VITE_API_BASE_URL"] ?? `${window.location.origin}/api`,
  {
    // MSWがfetchをパッチする前にclientが生成されても最新のfetchを使うよう遅延解決する
    fetch: (input: RequestInfo | URL, init?: RequestInit) => globalThis.fetch(input, init),
  },
);
