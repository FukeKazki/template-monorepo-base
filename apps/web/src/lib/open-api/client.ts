import createClient from "openapi-fetch";
import type { paths } from "./schema.gen";

export const apiClient = createClient<paths>({
  baseUrl: import.meta.env["VITE_API_BASE_URL"] ?? `${window.location.origin}/api`,
  // MSWがfetchをパッチする前にclientが生成されても最新のfetchを使うよう遅延解決する
  fetch: (...args: Parameters<typeof fetch>) => globalThis.fetch(...args),
});
