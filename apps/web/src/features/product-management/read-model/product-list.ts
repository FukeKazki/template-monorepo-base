import { TaggedError } from "better-result";
import * as v from "valibot";

const priceFormatter = new Intl.NumberFormat("ja-JP", {
  style: "currency",
  currency: "JPY",
});

export const ProductListItemSchema = v.pipe(
  v.object({
    id: v.pipe(v.string(), v.nonEmpty()),
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

export class InvalidProductListItemError extends TaggedError("InvalidProductListItemError")<{
  issues: v.BaseIssue<unknown>[];
}> {}

export const constructProductList = (
  data: { id: string; name: string; price: number; imageUrl: string }[],
): ProductList => {
  return data
    .map((item) => v.safeParse(ProductListItemSchema, item))
    .filter((result) => {
      if (!result.success) {
        console.error(new InvalidProductListItemError({ issues: result.issues }));
      }
      return result.success;
    })
    .map((result) => result.output);
};
