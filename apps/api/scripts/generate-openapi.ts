import { writeFile } from "node:fs/promises";
import path from "node:path";
import { generateSpecs } from "hono-openapi";
import app from "../src/index";
import { openApiOptions } from "../src/openapi";

// apps/web の codegen が読む契約ファイルを書き出す。
// 生成物だがコミット対象（CIで再生成して差分が出ないことを検証する）。
const specs = await generateSpecs(app, openApiOptions);
const outFile = path.resolve(import.meta.dirname, "../openapi.json");

await writeFile(outFile, `${JSON.stringify(specs, null, 2)}\n`);

console.log(`generated: ${outFile}`);
