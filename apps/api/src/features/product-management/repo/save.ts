import type { Save } from "../domain/ports";
import { store } from "./store";

export const save: Save = (product) => {
  store.set(product.id, product);
};
