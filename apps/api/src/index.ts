import { Hono } from "hono";
import { productRoute } from "./features/product-management/route";

const app = new Hono();

app.route("/", productRoute);

export default app;
