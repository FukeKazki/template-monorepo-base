import type { ProductId } from "../domain/product";
import { ProductNotFoundError, type ProductRepo } from "../domain/ports";

export const deleteProduct = async (repo: ProductRepo, id: string): Promise<boolean> =>
  !ProductNotFoundError.is(await repo.remove(id as ProductId));
