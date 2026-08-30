import type { FindAll } from "../domain/product";
import { store } from "./store";

export const findAll: FindAll = () => [...store.values()];
