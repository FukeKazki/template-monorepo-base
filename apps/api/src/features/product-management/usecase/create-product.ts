import * as domain from "../domain/product";
import type { ProductRepo } from "../domain/ports";
import type { CreateProductRequestDTO, ProductDTO } from "./schema";

export const createProduct = async (
  repo: ProductRepo,
  input: CreateProductRequestDTO,
): Promise<ProductDTO> => {
  const product = domain.createProduct(input);
  await repo.save(product);
  return product;
};
