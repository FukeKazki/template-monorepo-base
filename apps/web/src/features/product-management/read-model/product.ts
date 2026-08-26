import * as v from "valibot";

export const ProductSchema = v.object({
  name: v.pipe(v.string(), v.nonEmpty()),
  price: v.number(),
  imageUrl: v.pipe(v.string(), v.nonEmpty(), v.url()),
});

export type Product = v.InferOutput<typeof ProductSchema>;

export const constructProduct = (data: {
  name: string;
  price: number;
  imageUrl: string;
}): Product => {
  const result = v.safeParse(ProductSchema, data);

  if (!result.success) {
    throw new Error("Invalid product data");
  }
  return result.output;
};

export const constructProductList = (
  data: { name: string; price: number; imageUrl: string }[],
): Product[] => {
  return data.map((item) => constructProduct(item));
};
