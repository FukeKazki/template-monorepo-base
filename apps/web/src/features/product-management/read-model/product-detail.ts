import { TaggedError } from "better-result";
import * as v from "valibot";
import { ProductIdSchema } from "./product-id";

const priceFormatter = new Intl.NumberFormat("ja-JP", {
  style: "currency",
  currency: "JPY",
});

export const ProductDetailSchema = v.pipe(
  v.object({
    id: ProductIdSchema,
    name: v.pipe(v.string(), v.nonEmpty()),
    price: v.number(),
    imageUrl: v.pipe(v.string(), v.nonEmpty(), v.url()),
  }),
  v.transform((input) => ({
    ...input,
    formattedPrice: priceFormatter.format(input.price),
  })),
);

export type ProductDetail = v.InferOutput<typeof ProductDetailSchema>;

export class InvalidProductDetailError extends TaggedError("InvalidProductDetailError")<{
  issues: v.BaseIssue<unknown>[];
}> {}

export const constructProductDetail = (data: {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
}): ProductDetail | InvalidProductDetailError => {
  const result = v.safeParse(ProductDetailSchema, data);
  if (!result.success) {
    return new InvalidProductDetailError({ issues: result.issues });
  }
  return result.output;
};
