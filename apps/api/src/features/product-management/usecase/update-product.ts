import { changeProduct, type ProductId } from "../domain/product";
import { ProductNotFoundError, type ProductRepo } from "../domain/ports";
import type { ProductDTO, UpdateProductRequestDTO } from "./schema";

export const updateProduct = async (
  repo: ProductRepo,
  id: string,
  input: UpdateProductRequestDTO,
): Promise<ProductDTO | undefined> => {
  const existing = await repo.findById(id as ProductId);
  if (ProductNotFoundError.is(existing)) return undefined;
  const updated = changeProduct(existing, input);
  await repo.save(updated);
  return updated;
};
