import { eq } from "drizzle-orm";
import type { Db } from "@/lib/db";
import { ProductNotFoundError, type FindById } from "../domain/ports";
import { products } from "./table";

export const findById =
  (db: Db): FindById =>
  async (id) => {
    const product = await db.select().from(products).where(eq(products.id, id)).get();
    return product ?? new ProductNotFoundError({ cause: `product not found: ${id}` });
  };
