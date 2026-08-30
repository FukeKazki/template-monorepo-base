import * as domain from "../domain/product";
import { findById } from "../repo/findById";
import { save } from "../repo/save";
import type { ProductDTO, UpdateProductRequestDTO } from "./schema";

export const updateProduct = (
  id: string,
  input: UpdateProductRequestDTO,
): ProductDTO | undefined => {
  const existing = findById(id as domain.ProductId);
  if (domain.ProductNotFoundError.is(existing)) return undefined;
  const updated = domain.changeProduct(existing, input);
  save(updated);
  return updated;
};
