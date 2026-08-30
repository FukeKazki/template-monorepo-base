import { ProductNotFoundError, type Remove } from "../domain/ports";
import { store } from "./store";

export const remove: Remove = (id) => {
  if (!store.delete(id)) {
    return new ProductNotFoundError({ cause: "" });
  }
  return undefined;
};
