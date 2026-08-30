import type { ProductId } from "../domain/product";
import { ProductNotFoundError, type ProductRepo } from "../domain/ports";
import type { ProductDTO } from "./schema";

export const getProduct = async (
  repo: ProductRepo,
  id: string,
): Promise<ProductDTO | undefined> => {
  const result = await repo.findById(id as ProductId);
  return ProductNotFoundError.is(result) ? undefined : result;
};
