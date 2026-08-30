import { ProductNotFoundError, type FindById } from "../domain/product";
import { store } from "./store";

export const findById: FindById = (id) => {
  const product = store.get(id);
  if (!product) {
    return new ProductNotFoundError({ cause: "" });
  }
  return product;
};
