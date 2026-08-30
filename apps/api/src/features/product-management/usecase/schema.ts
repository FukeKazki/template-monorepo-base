import * as v from "valibot";

// リクエストの検証と、レスポンスに詰め替えるDTOの形をここで定義する。
// 型は Hono RPC 経由で apps/web にそのまま渡るため、ここを変えると web 側が型エラーになる。
export const ProductSchema = v.object({
  id: v.pipe(v.string(), v.nonEmpty()),
  name: v.pipe(v.string(), v.nonEmpty()),
  price: v.number(),
  imageUrl: v.pipe(v.string(), v.nonEmpty(), v.url()),
});

export const CreateProductRequestSchema = v.object({
  name: v.pipe(v.string(), v.nonEmpty()),
  price: v.number(),
  imageUrl: v.pipe(v.string(), v.nonEmpty(), v.url()),
});

export const UpdateProductRequestSchema = v.object({
  name: v.pipe(v.string(), v.nonEmpty()),
  price: v.number(),
  imageUrl: v.pipe(v.string(), v.nonEmpty(), v.url()),
});

export const ProductIdParamSchema = v.object({
  id: v.pipe(v.string(), v.nonEmpty()),
});

export type ProductDTO = v.InferOutput<typeof ProductSchema>;
export type CreateProductRequestDTO = v.InferOutput<typeof CreateProductRequestSchema>;
export type UpdateProductRequestDTO = v.InferOutput<typeof UpdateProductRequestSchema>;
