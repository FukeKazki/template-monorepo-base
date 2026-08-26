import { Result, TaggedError, type Result as ResultType } from "better-result";
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

export class InvalidProductListError extends TaggedError("InvalidProductListError")<{
  issues: v.BaseIssue<unknown>[];
}> {}

export const constructProductList = (
  data: { name: string; price: number; imageUrl: string }[],
): ResultType<ProductList, InvalidProductListError> => {
  const result = v.safeParse(ProductListSchema, data);

  if (!result.success) {
    return Result.err(new InvalidProductListError({ issues: result.issues }));
  }
  return Result.ok(result.output);
};
