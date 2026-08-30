import { sValidator } from "@hono/standard-validator";
import { Hono } from "hono";
import { createDb } from "@/lib/db";
import { createProductRepo } from "./repo";
import { createProduct } from "./usecase/create-product";
import { deleteProduct } from "./usecase/delete-product";
import { getProduct } from "./usecase/get-product";
import { getProductList } from "./usecase/get-product-list";
import {
  CreateProductRequestSchema,
  ProductIdParamSchema,
  UpdateProductRequestSchema,
} from "./usecase/schema";
import { updateProduct } from "./usecase/update-product";

const NOT_FOUND_MESSAGE = "商品が見つかりません";

// sValidatorはデフォルトだとvalibotのissueをそのままレスポンスに出してしまうため、
// 第3引数のhookで { message } の形に揃える。
const BAD_REQUEST_MESSAGE = "リクエストが不正です";

const repoOf = (c: { env: Env }) => createProductRepo(createDb(c.env.DB));

// RPCの型はここでのメソッドチェーンから推論される。ルートを分割代入したり
// 途中で変数に受け直したりすると型が落ちるので、必ずチェーンで書き続けること。
// ステータスコードもクライアント側のナローイングのために明示する。
export const productRoute = new Hono<{ Bindings: Env }>()
  .get("/products", async (c) => c.json(await getProductList(repoOf(c)), 200))
  .post(
    "/products",
    sValidator("json", CreateProductRequestSchema, (result, c) =>
      result.success ? undefined : c.json({ message: BAD_REQUEST_MESSAGE }, 400),
    ),
    async (c) => c.json(await createProduct(repoOf(c), c.req.valid("json")), 201),
  )
  .get(
    "/products/:id",
    sValidator("param", ProductIdParamSchema, (result, c) =>
      result.success ? undefined : c.json({ message: BAD_REQUEST_MESSAGE }, 400),
    ),
    async (c) => {
      const product = await getProduct(repoOf(c), c.req.valid("param").id);
      if (!product) {
        return c.json({ message: NOT_FOUND_MESSAGE }, 404);
      }
      return c.json(product, 200);
    },
  )
  .put(
    "/products/:id",
    sValidator("param", ProductIdParamSchema, (result, c) =>
      result.success ? undefined : c.json({ message: BAD_REQUEST_MESSAGE }, 400),
    ),
    sValidator("json", UpdateProductRequestSchema, (result, c) =>
      result.success ? undefined : c.json({ message: BAD_REQUEST_MESSAGE }, 400),
    ),
    async (c) => {
      const product = await updateProduct(repoOf(c), c.req.valid("param").id, c.req.valid("json"));
      if (!product) {
        return c.json({ message: NOT_FOUND_MESSAGE }, 404);
      }
      return c.json(product, 200);
    },
  )
  .delete(
    "/products/:id",
    sValidator("param", ProductIdParamSchema, (result, c) =>
      result.success ? undefined : c.json({ message: BAD_REQUEST_MESSAGE }, 400),
    ),
    async (c) => {
      if (!(await deleteProduct(repoOf(c), c.req.valid("param").id))) {
        return c.json({ message: NOT_FOUND_MESSAGE }, 404);
      }
      return c.body(null, 204);
    },
  );
