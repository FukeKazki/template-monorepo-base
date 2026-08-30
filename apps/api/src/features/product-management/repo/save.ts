import type { Db } from "@/lib/db";
import type { Save } from "../domain/ports";
import { products } from "./table";

export const save =
  (db: Db): Save =>
  async (product) => {
    await db
      .insert(products)
      .values(product)
      .onConflictDoUpdate({
        target: products.id,
        set: { name: product.name, price: product.price, imageUrl: product.imageUrl },
      });
  };
