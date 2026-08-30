import type { ProductRepo } from "../domain/ports";
import type { ProductDTO } from "./schema";

export const getProductList = (repo: ProductRepo): Promise<ProductDTO[]> => repo.findAll();
