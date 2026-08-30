import { findAll } from "../repo/findAll";
import type { ProductDTO } from "./schema";

export const getProductList = (): ProductDTO[] => findAll();
