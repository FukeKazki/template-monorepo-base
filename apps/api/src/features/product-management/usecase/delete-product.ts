import type { ProductId } from "../domain/product";
import { ProductNotFoundError } from "../domain/ports";
import { remove } from "../repo/remove";

export const deleteProduct = (id: string): boolean =>
  !ProductNotFoundError.is(remove(id as ProductId));
