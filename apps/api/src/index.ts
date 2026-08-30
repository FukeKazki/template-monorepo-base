import { Hono } from "hono";
import { productRoute } from "./features/product-management/route";

const app = new Hono<{ Bindings: Env }>();

app.route("/", productRoute);

export default app;
