import { TaggedError } from "better-result";
import type { Product, ProductId } from "./product";

export class ProductNotFoundError extends TaggedError("ProductNotFound")<{
  cause?: unknown;
}> {}

export type FindAll = () => Product[];
export type FindById = (id: ProductId) => Product | ProductNotFoundError;
export type Save = (product: Product) => void;
export type Remove = (id: ProductId) => ProductNotFoundError | undefined;
