import type { FindAll } from "../domain/ports";
import { store } from "./store";

export const findAll: FindAll = () => [...store.values()];
