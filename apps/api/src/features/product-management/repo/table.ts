import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import type { ProductId } from "../domain/product";

export const products = sqliteTable("products", {
  id: text("id").primaryKey().$type<ProductId>(),
  name: text("name").notNull(),
  price: integer("price").notNull(),
  imageUrl: text("image_url").notNull(),
});
