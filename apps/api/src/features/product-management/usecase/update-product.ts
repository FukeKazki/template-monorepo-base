import { changeProduct, type ProductId } from "../domain/product";
import { ProductNotFoundError } from "../domain/ports";
import { findById } from "../repo/findById";
import { save } from "../repo/save";
import type { ProductDTO, UpdateProductRequestDTO } from "./schema";

export const updateProduct = (
  id: string,
  input: UpdateProductRequestDTO,
): ProductDTO | undefined => {
  const existing = findById(id as ProductId);
  if (ProductNotFoundError.is(existing)) return undefined;
  const updated = changeProduct(existing, input);
  save(updated);
  return updated;
};
