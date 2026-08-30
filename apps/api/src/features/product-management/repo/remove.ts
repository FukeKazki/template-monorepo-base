import { eq } from "drizzle-orm";
import type { Db } from "@/lib/db";
import { ProductNotFoundError, type Remove } from "../domain/ports";
import { products } from "./table";

export const remove =
  (db: Db): Remove =>
  async (id) => {
    const result = await db.delete(products).where(eq(products.id, id));
    if (result.meta.changes === 0) {
      return new ProductNotFoundError({ cause: `product not found: ${id}` });
    }
    return undefined;
  };
