# apps/api の永続化層を Cloudflare D1 に移行する

## Context

`apps/api` の永続化層は現在 [store.ts](apps/api/src/features/product-management/repo/store.ts) のインメモリ `Map` で、ファイル冒頭のコメントどおり「永続化層を入れるまでの暫定実装」になっている。Worker の isolate ごとに状態を持つため、再起動やスケールアウトで初期値に戻り、本番として成立しない。

これを Cloudflare D1 に置き換える。加えて、ローカル開発（`wrangler dev` / miniflare のローカル D1）でも同じコードパスで検証できる状態にする。

このリポジトリは他プロジェクトの土台となるテンプレートなので、「D1 を使う feature の書き方」の見本になる構成を目指す。

### 採用する方針（確認済み）

- **Drizzle ORM**（`drizzle-orm/d1` + `drizzle-kit`）を導入し、テーブル定義を TS で持ち、マイグレーション SQL を生成する
- **repo をファクトリ化**する。`repo/*.ts` が `(db) => Port` を返し、route で `c.env.DB` から組み立てて usecase に渡す。`domain/ports.ts` は Cloudflare / Drizzle の型に依存させない
- **インメモリ store は削除**し、D1 に一本化する（シードデータは seed SQL へ移す）
- **`route.spec.ts` は削除**する（D1 前提になり現状のモジュールシングルトン依存のテストが成立しないため）

### 影響しないもの

DTO / valibot スキーマ（[usecase/schema.ts](apps/api/src/features/product-management/usecase/schema.ts)）は変更しないため、**`apps/api/openapi.json` に差分は出ない**。したがって `apps/web` 側の変更も不要（CI の `git diff --exit-code apps/api/openapi.json` はそのまま通るはず）。

---

## 実装

### 1. 依存追加

`apps/api/package.json`:

- dependencies: `drizzle-orm`
- devDependencies: `drizzle-kit`

### 2. D1 バインディングと設定

**[apps/api/wrangler.jsonc](apps/api/wrangler.jsonc)** に追加:

```jsonc
"d1_databases": [
  {
    "binding": "DB",
    "database_name": "template-monorepo-db",
    "database_id": "<wrangler d1 create で払い出された ID>",
    "migrations_dir": "drizzle/migrations"
  }
]
```

- ローカル（`--local`）は `database_id` を検証しないので、リモート未作成の間はプレースホルダ文字列でもローカル検証は動く。デプロイ前に `pnpm --filter @repo/api exec wrangler d1 create template-monorepo-db` で実 ID に差し替える
- 追加後 `pnpm --filter @repo/api codegen`（`wrangler types`）で `worker-configuration.d.ts` の `Env` に `DB: D1Database` が入る。以降 `new Hono<{ Bindings: Env }>()` が使える
- ローカル D1 の実体は `.wrangler/state` 配下。`.gitignore` に `.wrangler/` が既にあるので追加対応は不要

**新規 `apps/api/drizzle.config.ts`**:

```ts
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "sqlite",
  schema: "./src/features/*/repo/table.ts",
  out: "./drizzle/migrations",
});
```

`schema` を glob にして feature ローカルにテーブル定義を置く規約にする（feature が増えても config を触らない）。`driver: "d1-http"` は付けない — マイグレーションの**適用**は wrangler 側で行い、drizzle-kit は**生成**だけに使うため、Cloudflare の API トークンを不要にする。

### 3. DB クライアント

**新規 [apps/api/src/lib/db.ts](apps/api/src/lib/db.ts)**:

```ts
import { drizzle } from "drizzle-orm/d1";

export const createDb = (d1: D1Database) => drizzle(d1);
export type Db = ReturnType<typeof createDb>;
```

### 4. テーブル定義

**新規 `apps/api/src/features/product-management/repo/table.ts`**:

```ts
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import type { ProductId } from "../domain/product";

export const products = sqliteTable("products", {
  id: text("id").primaryKey().$type<ProductId>(),
  name: text("name").notNull(),
  price: integer("price").notNull(),
  imageUrl: text("image_url").notNull(),
});
```

- `$type<ProductId>()` でブランド型を載せると、select 結果がそのまま `Product` の形になり、DTO/domain へのマッパーが不要になる
- ファイル名は `table.ts`。既存の `usecase/schema.ts`（valibot / OpenAPI 用）と紛らわしいので drizzle 慣習の `schema.ts` は避ける

### 5. ports を非同期化

**[domain/ports.ts](apps/api/src/features/product-management/domain/ports.ts)** — 戻り値を `Promise` 化し、repo 一式の型を追加する。エラー表現（`T | ProductNotFoundError`、`better-result` の `TaggedError`）は現状のまま維持する。

```ts
export type FindAll = () => Promise<Product[]>;
export type FindById = (id: ProductId) => Promise<Product | ProductNotFoundError>;
export type Save = (product: Product) => Promise<void>;
export type Remove = (id: ProductId) => Promise<ProductNotFoundError | undefined>;

export type ProductRepo = { findAll: FindAll; findById: FindById; save: Save; remove: Remove };
```

ここに `D1Database` / `Db` を持ち込まないこと（domain のインフラ非依存を保つ）。

### 6. repo をファクトリ化

`repo/store.ts` を**削除**し、`repo/{findAll,findById,save,remove}.ts` を `(db: Db) => Port` の形に書き換える。

```ts
// repo/findById.ts
import { eq } from "drizzle-orm";
import type { Db } from "@/lib/db";
import { ProductNotFoundError, type FindById } from "../domain/ports";
import { products } from "./table";

export const findById =
  (db: Db): FindById =>
  async (id) => {
    const row = await db.select().from(products).where(eq(products.id, id)).get();
    return row ?? new ProductNotFoundError({ cause: `product not found: ${id}` });
  };
```

- `findAll`: `db.select().from(products).all()`
- `save`: upsert（新規作成と更新の両方から呼ばれるため）
  `db.insert(products).values(product).onConflictDoUpdate({ target: products.id, set: { name, price, imageUrl } })`
- `remove`: `db.delete(products).where(eq(products.id, id))` の結果 `meta.changes === 0`（もしくは `.returning()` が空）なら `ProductNotFoundError` を返す

**新規 `repo/index.ts`**（feature 単位の composition root）:

```ts
export const createProductRepo = (db: Db): ProductRepo => ({
  findAll: findAll(db),
  findById: findById(db),
  save: save(db),
  remove: remove(db),
});
```

### 7. usecase に repo を注入

`usecase/*.ts` の 4 ファイル（`get-product-list` / `get-product` / `create-product` / `update-product` / `delete-product`）から repo の直接 import を外し、第 1 引数で `ProductRepo` を受け取る async 関数にする。ロジック（`ProductNotFoundError.is()` での分岐、`undefined`/`boolean` への畳み込み、`id as ProductId` キャスト）は現状のまま。

```ts
// usecase/get-product.ts
export const getProduct = async (
  repo: ProductRepo,
  id: string,
): Promise<ProductDTO | undefined> => {
  const result = await repo.findById(id as ProductId);
  return ProductNotFoundError.is(result) ? undefined : result;
};
```

### 8. route から組み立てる

**[route.ts](apps/api/src/features/product-management/route.ts)**:

- `new Hono()` → `new Hono<{ Bindings: Env }>()`
- 各ハンドラを `async` にし、冒頭で repo を組み立てる

```ts
const repoOf = (c: Context<{ Bindings: Env }>) => createProductRepo(createDb(c.env.DB));

// 例
async (c) => c.json(await getProductList(repoOf(c)));
```

`describeRoute` / `validator` / エラーメッセージ定数・レスポンス定義は一切変更しない（OpenAPI 出力を変えないため）。

**[src/index.ts](apps/api/src/index.ts)** も `new Hono<{ Bindings: Env }>()` に変更。

### 9. マイグレーションとシード

1. `pnpm --filter @repo/api db:generate` で `apps/api/drizzle/migrations/0000_*.sql`（+ `meta/`）を生成し、**コミットする**
2. **新規 `apps/api/drizzle/seed.sql`** — [store.ts](apps/api/src/features/product-management/repo/store.ts) の 3 件（ワイヤレスマウス / メカニカルキーボード / USB-Cハブ、id `1`〜`3`）を `INSERT OR IGNORE INTO products ...` として移植する。マイグレーションには含めない（リモートに開発用シードを流し込まないため）

`apps/api/package.json` に追加するスクリプト:

```json
"db:generate": "drizzle-kit generate",
"db:migrate": "wrangler d1 migrations apply DB --local",
"db:migrate:remote": "wrangler d1 migrations apply DB --remote",
"db:seed": "wrangler d1 execute DB --local --file=./drizzle/seed.sql"
```

### 10. テストの削除

- `apps/api/src/features/product-management/route.spec.ts` を削除
- `apps/api` にテストが 0 件になるため、`test` / `test:unit` を `vitest run --passWithNoTests` に変更する（CI の `pnpm -r run test:unit` が落ちないように）。`vitest.config.ts` は将来のテスト追加のために残す

### 11. ドキュメント更新

[CLAUDE.md](CLAUDE.md) を更新する:

- Commands セクションに `db:generate` / `db:migrate` / `db:seed` と、初回セットアップ手順を追加
- 「apps/api の構造」の `repo/` の説明を「インメモリ」→「Drizzle 経由の D1。`(db) => Port` のファクトリで、`repo/index.ts` の `createProductRepo` が composition root」に書き換え。`store.ts` の記述を `table.ts` に差し替え
- デプロイ手順に「初回は `wrangler d1 create` → `database_id` を wrangler.jsonc に記入 → `db:migrate:remote`」を追記
- 「実APIに繋いで動かす」セクションに、ローカル D1 の初期化手順を追記

---

## 検証

初回セットアップ:

```bash
pnpm install
pnpm --filter @repo/api db:generate    # migrations/0000_*.sql が出る
pnpm --filter @repo/api db:migrate     # ローカル D1 にテーブル作成
pnpm --filter @repo/api db:seed        # 商品3件を投入
```

CI 相当のチェック（この順で通ること）:

```bash
pnpm lint
pnpm format:check
pnpm typecheck
pnpm --filter @repo/api run openapi
git diff --exit-code apps/api/openapi.json   # ← 差分ゼロであること（DTO 不変なので出ないはず）
pnpm -r run test:unit
pnpm build
```

API 単体の疎通（ターミナル1で `pnpm dev:api`、http://localhost:8787）:

```bash
curl -s localhost:8787/products                      # シードの3件が返る
curl -s -X POST localhost:8787/products \
  -H 'content-type: application/json' \
  -d '{"name":"テスト","price":100,"imageUrl":"https://picsum.photos/seed/t/100"}'   # 201
curl -s localhost:8787/products/<返ってきたid>        # 200
curl -s -X PUT localhost:8787/products/<id> -H 'content-type: application/json' \
  -d '{"name":"更新","price":200,"imageUrl":"https://picsum.photos/seed/u/100"}'     # 200
curl -s -o /dev/null -w '%{http_code}\n' -X DELETE localhost:8787/products/<id>      # 204
curl -s -o /dev/null -w '%{http_code}\n' localhost:8787/products/nonexistent         # 404
curl -s -X POST localhost:8787/products -H 'content-type: application/json' -d '{}'  # 400
```

**永続化の確認（今回の主眼）**: POST で 1 件足したあと `wrangler dev` を Ctrl-C で落として再起動し、`GET /products` にその 1 件が残っていること。インメモリ実装なら消えていた挙動が変わる。

web からの結合確認（ターミナル2）:

```bash
USE_MOCK=false pnpm dev    # MSW を止めて Vite proxy 経由で apps/api へ
```

商品一覧・詳細・登録・更新・削除が画面から一通り動くこと。

本番相当（両 Worker 同時起動）:

```bash
pnpm --filter @repo/web build
pnpm --filter @repo/web dev:worker
```

`/api/products` が D1 のデータを返すこと（`index.html` が返ってきたら `run_worker_first` の問題）。
