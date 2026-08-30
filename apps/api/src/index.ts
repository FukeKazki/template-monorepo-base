import { Hono } from "hono";
import { cors } from "hono/cors";
import { openAPIRouteHandler } from "hono-openapi";
import { productRoute } from "./features/product-management/route";
import { openApiOptions } from "./openapi";

const app = new Hono();

app.use("*", cors());

app.route("/", productRoute);

// apps/web はビルド時に openapi.json (scripts/generate-openapi.ts の出力) から型を生成するため、
// このエンドポイントは動作確認・外部ツール連携用。
app.get("/openapi.json", openAPIRouteHandler(app, openApiOptions));

export default app;
