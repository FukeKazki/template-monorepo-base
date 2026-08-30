import * as domain from "../domain/product";
import { findById } from "../repo/findById";
import type { ProductDTO } from "./schema";

export const getProduct = (id: string): ProductDTO | undefined => {
  const result = findById(id as domain.ProductId);
  return domain.ProductNotFoundError.is(result) ? undefined : result;
};
