import { Hono } from "hono";
import { describeRoute, resolver, validator } from "hono-openapi";
import { createDb } from "@/lib/db";
import { createProductRepo } from "./repo";
import { createProduct } from "./usecase/create-product";
import { deleteProduct } from "./usecase/delete-product";
import { getProduct } from "./usecase/get-product";
import { getProductList } from "./usecase/get-product-list";
import {
  CreateProductRequestSchema,
  ErrorSchema,
  ProductIdParamSchema,
  ProductListSchema,
  ProductSchema,
  UpdateProductRequestSchema,
} from "./usecase/schema";
import { updateProduct } from "./usecase/update-product";

const jsonContent = <T>(schema: T) => ({ "application/json": { schema } }) as const;

const notFoundResponse = {
  description: "商品が見つからない",
  content: jsonContent(resolver(ErrorSchema)),
};

const badRequestResponse = {
  description: "リクエストが不正",
  content: jsonContent(resolver(ErrorSchema)),
};

const NOT_FOUND_MESSAGE = "商品が見つかりません";

// validatorはデフォルトだとvalibotのissueをそのままレスポンスに出してしまうため、
// 各validatorの第3引数のhookでOpenAPIに載せている Error スキーマの形に揃える。
const BAD_REQUEST_MESSAGE = "リクエストが不正です";

const repoOf = (c: { env: Env }) => createProductRepo(createDb(c.env.DB));

export const productRoute = new Hono<{ Bindings: Env }>()
  .get(
    "/products",
    describeRoute({
      operationId: "listProducts",
      summary: "商品一覧を取得する",
      responses: {
        200: { description: "商品一覧", content: jsonContent(resolver(ProductListSchema)) },
      },
    }),
    async (c) => c.json(await getProductList(repoOf(c))),
  )
  .post(
    "/products",
    describeRoute({
      operationId: "createProduct",
      summary: "商品を登録する",
      responses: {
        201: { description: "登録した商品", content: jsonContent(resolver(ProductSchema)) },
        400: badRequestResponse,
      },
    }),
    validator("json", CreateProductRequestSchema, (result, c) =>
      result.success ? undefined : c.json({ message: BAD_REQUEST_MESSAGE }, 400),
    ),
    async (c) => c.json(await createProduct(repoOf(c), c.req.valid("json")), 201),
  )
  .get(
    "/products/:id",
    describeRoute({
      operationId: "getProduct",
      summary: "商品詳細を取得する",
      responses: {
        200: { description: "商品詳細", content: jsonContent(resolver(ProductSchema)) },
        404: notFoundResponse,
      },
    }),
    validator("param", ProductIdParamSchema),
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
    describeRoute({
      operationId: "updateProduct",
      summary: "商品を更新する",
      responses: {
        200: { description: "更新した商品", content: jsonContent(resolver(ProductSchema)) },
        400: badRequestResponse,
        404: notFoundResponse,
      },
    }),
    validator("param", ProductIdParamSchema),
    validator("json", UpdateProductRequestSchema, (result, c) =>
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
    describeRoute({
      operationId: "deleteProduct",
      summary: "商品を削除する",
      responses: {
        204: { description: "削除成功" },
        404: notFoundResponse,
      },
    }),
    validator("param", ProductIdParamSchema),
    async (c) => {
      if (!(await deleteProduct(repoOf(c), c.req.valid("param").id))) {
        return c.json({ message: NOT_FOUND_MESSAGE }, 404);
      }
      return c.body(null, 204);
    },
  );
