import { Hono } from "hono";
import { describeRoute, resolver, validator } from "hono-openapi";
import {
  createProduct,
  deleteProduct,
  findProduct,
  listProducts,
  updateProduct,
} from "./repository";
import {
  CreateProductRequestSchema,
  ErrorSchema,
  ProductIdParamSchema,
  ProductListSchema,
  ProductSchema,
  UpdateProductRequestSchema,
} from "./schema";

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

export const productRoute = new Hono()
  .get(
    "/products",
    describeRoute({
      operationId: "listProducts",
      summary: "商品一覧を取得する",
      responses: {
        200: { description: "商品一覧", content: jsonContent(resolver(ProductListSchema)) },
      },
    }),
    (c) => c.json(listProducts()),
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
    (c) => c.json(createProduct(c.req.valid("json")), 201),
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
    (c) => {
      const product = findProduct(c.req.valid("param").id);
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
    (c) => {
      const product = updateProduct(c.req.valid("param").id, c.req.valid("json"));
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
    (c) => {
      if (!deleteProduct(c.req.valid("param").id)) {
        return c.json({ message: NOT_FOUND_MESSAGE }, 404);
      }
      return c.body(null, 204);
    },
  );
