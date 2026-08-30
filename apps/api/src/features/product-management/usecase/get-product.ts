import type { ProductId } from "../domain/product";
import { ProductNotFoundError } from "../domain/ports";
import { findById } from "../repo/findById";
import type { ProductDTO } from "./schema";

export const getProduct = (id: string): ProductDTO | undefined => {
  const result = findById(id as ProductId);
  return ProductNotFoundError.is(result) ? undefined : result;
};
