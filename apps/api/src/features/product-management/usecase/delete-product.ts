import * as domain from "../domain/product";
import { remove } from "../repo/remove";

export const deleteProduct = (id: string): boolean =>
  !domain.ProductNotFoundError.is(remove(id as domain.ProductId));
