import * as v from "valibot";

export const ProductIdSchema = v.pipe(v.string(), v.brand("productId"));
export type ProductId = v.InferOutput<typeof ProductIdSchema>;

export const ProductSchema = v.object({
  id: ProductIdSchema,
  name: v.string(),
  price: v.number(),
  imageUrl: v.pipe(v.string(), v.url()),
});
export type Product = v.InferOutput<typeof ProductSchema>;

type ProductAttributes = {
  name: string;
  price: number;
  imageUrl: string;
};

export const createProduct = (attributes: ProductAttributes): Product => ({
  id: crypto.randomUUID() as ProductId,
  ...attributes,
});

export const changeProduct = (product: Product, attributes: ProductAttributes): Product => ({
  ...product,
  ...attributes,
});
