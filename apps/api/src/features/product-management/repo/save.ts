import type { Save } from "../domain/product";
import { store } from "./store";

export const save: Save = (product) => {
  store.set(product.id, product);
};
