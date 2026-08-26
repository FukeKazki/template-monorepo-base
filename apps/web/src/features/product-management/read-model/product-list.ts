import * as v from "valibot";

const priceFormatter = new Intl.NumberFormat("ja-JP", {
  style: "currency",
  currency: "JPY",
});

export const ProductListItemSchema = v.pipe(
  v.object({
    name: v.pipe(v.string(), v.nonEmpty()),
    price: v.number(),
    imageUrl: v.pipe(v.string(), v.nonEmpty(), v.url()),
  }),
  v.transform((input) => ({
    ...input,
    formattedPrice: priceFormatter.format(input.price),
  })),
);

export type ProductListItem = v.InferOutput<typeof ProductListItemSchema>;

export const ProductListSchema = v.array(ProductListItemSchema);

export type ProductList = v.InferOutput<typeof ProductListSchema>;

export const constructProductList = (
  data: { name: string; price: number; imageUrl: string }[],
): ProductList => {
  const result = v.safeParse(ProductListSchema, data);

  if (!result.success) {
    throw new Error("Invalid product list data");
  }
  return result.output;
};
