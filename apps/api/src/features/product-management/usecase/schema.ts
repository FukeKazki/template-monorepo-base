import * as v from "valibot";

// v.metadata({ ref }) を付けたスキーマは OpenAPI の components.schemas に
// その名前で登録され、参照側は $ref になる。
// ここでの ref 名がそのまま apps/web の components["schemas"][...] のキーになるため、
// リネームは web 側の破壊的変更になる。
export const ProductSchema = v.pipe(
  v.object({
    id: v.pipe(v.string(), v.nonEmpty()),
    name: v.pipe(v.string(), v.nonEmpty()),
    price: v.number(),
    imageUrl: v.pipe(v.string(), v.nonEmpty(), v.url()),
  }),
  v.metadata({ ref: "Product" }),
);

export const CreateProductRequestSchema = v.pipe(
  v.object({
    name: v.pipe(v.string(), v.nonEmpty()),
    price: v.number(),
    imageUrl: v.pipe(v.string(), v.nonEmpty(), v.url()),
  }),
  v.metadata({ ref: "CreateProductRequest" }),
);

export const UpdateProductRequestSchema = v.pipe(
  v.object({
    name: v.pipe(v.string(), v.nonEmpty()),
    price: v.number(),
    imageUrl: v.pipe(v.string(), v.nonEmpty(), v.url()),
  }),
  v.metadata({ ref: "UpdateProductRequest" }),
);

export const ErrorSchema = v.pipe(
  v.object({
    message: v.string(),
  }),
  v.metadata({ ref: "Error" }),
);

export const ProductListSchema = v.array(ProductSchema);

export const ProductIdParamSchema = v.object({
  id: v.pipe(v.string(), v.nonEmpty()),
});

export type ProductDTO = v.InferOutput<typeof ProductSchema>;
export type CreateProductRequestDTO = v.InferOutput<typeof CreateProductRequestSchema>;
export type UpdateProductRequestDTO = v.InferOutput<typeof UpdateProductRequestSchema>;
