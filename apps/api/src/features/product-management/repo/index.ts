import type { Db } from "@/lib/db";
import type { ProductRepo } from "../domain/ports";
import { findAll } from "./findAll";
import { findById } from "./findById";
import { remove } from "./remove";
import { save } from "./save";

export const createProductRepo = (db: Db): ProductRepo => ({
  findAll: findAll(db),
  findById: findById(db),
  save: save(db),
  remove: remove(db),
});
