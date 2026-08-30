import type { Db } from "@/lib/db";
import type { FindAll } from "../domain/ports";
import { products } from "./table";

export const findAll =
  (db: Db): FindAll =>
  () =>
    db.select().from(products).all();
