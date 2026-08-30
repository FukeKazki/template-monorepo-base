import { TaggedError } from "better-result";
import type { Product, ProductId } from "./product";

export class ProductNotFoundError extends TaggedError("ProductNotFound")<{
  cause?: unknown;
}> {}

export type FindAll = () => Promise<Product[]>;
export type FindById = (id: ProductId) => Promise<Product | ProductNotFoundError>;
export type Save = (product: Product) => Promise<void>;
export type Remove = (id: ProductId) => Promise<ProductNotFoundError | undefined>;

export type ProductRepo = {
  findAll: FindAll;
  findById: FindById;
  save: Save;
  remove: Remove;
};
