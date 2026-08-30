import { Hono } from "hono";
import type { BlankEnv, ExtractSchema } from "hono/types";
import { productRoute } from "./features/product-management/route";

// RPCの型推論のため .route() はチェーンで書く（別行で app.route(...) すると型が落ちる）
const app = new Hono<{ Bindings: Env }>().route("/", productRoute);

// apps/web の hc に渡す公開型。Bindings(Env) を落として
// Workers 固有のグローバル型が web 側に漏れないようにする。
export type AppType = Hono<BlankEnv, ExtractSchema<typeof app>, "/">;

export default app;
