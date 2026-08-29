import * as v from "valibot";

export const ProductIdSchema = v.pipe(v.string(), v.nonEmpty(), v.brand("ProductId"));
export type ProductId = v.InferOutput<typeof ProductIdSchema>;
