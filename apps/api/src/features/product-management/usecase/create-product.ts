import * as domain from "../domain/product";
import { save } from "../repo/save";
import type { CreateProductRequestDTO, ProductDTO } from "./schema";

export const createProduct = (input: CreateProductRequestDTO): ProductDTO => {
  const product = domain.createProduct(input);
  save(product);
  return product;
};
