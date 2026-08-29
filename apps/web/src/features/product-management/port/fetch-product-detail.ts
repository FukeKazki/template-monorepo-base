import { TaggedError } from "better-result";

export class FetchProductDetailError extends TaggedError("FetchProductDetailError")<{
  cause?: unknown;
}> {}

export class ProductNotFoundError extends TaggedError("ProductNotFoundError")<{
  id: string;
}> {}

export type ProductDetailRecord = { id: string; name: string; price: number; imageUrl: string };

export type FetchProductDetail = (
  id: string,
) => Promise<ProductDetailRecord | ProductNotFoundError | FetchProductDetailError>;
