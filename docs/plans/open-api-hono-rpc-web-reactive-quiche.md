# OpenAPI を廃止して Hono RPC で型共有する

## Context

現在 `apps/api` と `apps/web` は `apps/api/openapi.json` という契約ファイル1点だけで繋がっている。この構成は「api実装 → openapi.json（コミット） → openapi-typescript → `schema.gen.ts`」という多段の生成パイプラインを必要とし、次のコストを恒常的に払っている。

- ルート定義に `describeRoute` / `resolver` / `jsonContent` の記述が重複する（[route.ts](../../apps/api/src/features/product-management/route.ts) は125行のうち大半がOpenAPIメタ情報）
- `v.metadata({ ref: "Xxx" })` の付け忘れでweb側の型が生成されない、`ref` 名のリネームが破壊的変更になる、といったOpenAPI固有の落とし穴がある
- `openapi.json` をコミットし、CIで再生成して差分検証するステップが必要
- 生成物 `schema.gen.ts` が無いと web の型チェックが通らない（`codegen` 依存）

同じモノレポ内の Hono サーバーと React クライアントであれば、Hono RPC（`hc`）で **api の型を直接 web に渡す**ほうが素直で、契約ファイルもコード生成も不要になる。api の変更は `tsc` が即座にweb側の破壊として検出するため、契約検証としてはむしろ強くなる。

トレードオフとして、**外部向けのAPIドキュメント（openapi.json）は失われる**。この2アプリ構成のテンプレートでは許容する。また `openapi-msw` によるMSWハンドラのパス型安全性も失われるため、MSWは素の `msw` に戻し、レスポンスbodyだけ `InferResponseType` で型付けする。

決定事項（ユーザー確認済み）:

1. OpenAPI は完全に廃止する（`hono-openapi`・`openapi.json`・CIの差分検証を削除）
2. 型は **apps/api が `.d.ts` を emit し、apps/web が type-only import** する（TS Project References によるソース直参照はしない）
3. MSW は素の `msw` + `hc` 由来の型で書く

## 方針の要点

### なぜ「.d.ts を emit」か

`apps/api` は Cloudflare Workers 用に `lib` から DOM を外し、グローバルの `Env` / `D1Database`（`wrangler types` 生成の `worker-configuration.d.ts`）に依存している。web の tsconfig（DOM lib あり、`types: ["vite/client", ...]`）から api の**ソース**を直接型解決させると、この lib / types の分離が壊れる。d.ts をワンクッション挟み、さらに公開する `AppType` から Bindings（`Env`）を消すことで、Workers 固有の型が web に漏れないようにする。

### 公開する型（Bindings を消す）

```ts
// apps/api/src/index.ts
import { Hono } from "hono";
import type { BlankEnv, ExtractSchema } from "hono/types";
import { productRoute } from "./features/product-management/route";

// RPCの型推論のためチェーンで書く（app.route() を別行にすると型が落ちる）
const app = new Hono<{ Bindings: Env }>().route("/", productRoute);

// hc に渡す公開型。Bindings(Env) を落とし、Workers 固有の型が apps/web に漏れないようにする。
export type AppType = Hono<BlankEnv, ExtractSchema<typeof app>, "/">;

export default app;
```

`ExtractSchema` は `hono/types` が提供する既存ユーティリティ。ルートの実体は現状どおり `route.ts` 側でメソッドチェーンで定義されているのでそのまま使える。

## 変更内容

### 1. apps/api — OpenAPI の除去

- **[route.ts](../../apps/api/src/features/product-management/route.ts)**: `describeRoute` / `resolver` / `jsonContent` / `notFoundResponse` / `badRequestResponse` をすべて削除。`hono-openapi` の `validator` を、既に依存にある **`@hono/standard-validator` の `sValidator`** に置換する。バリデーション失敗時に valibot の issue が漏れないよう、第3引数のhook（`result.success ? undefined : c.json({ message: BAD_REQUEST_MESSAGE }, 400)`）は**そのまま残す**。ステータスコードは `c.json(x, 201)` のように**明示し続ける**（クライアント側の型ナローイングに必要）。
- **[index.ts](../../apps/api/src/index.ts)**: 上記のとおりチェーン化し、`AppType` を export。
- 削除: `src/openapi.ts`、`scripts/generate-openapi.ts`、`openapi.json`
- `package.json`: `openapi` スクリプト削除。依存から `hono-openapi` / `@standard-community/standard-openapi` / `@standard-community/standard-json` / `@valibot/to-json-schema` / `quansync` / `openapi-types` / `@types/json-schema` / `tsx`（generate-openapi 専用だった）を削除。`@hono/standard-validator`・`valibot`・`hono`・`drizzle-orm`・`better-result` は維持。
- `usecase/schema.ts`: `v.metadata({ ref: ... })` は OpenAPI 専用なので削除（`ProductSchema` などのスキーマ本体とDTO型は維持。`ErrorSchema` はレスポンス整形用に残す）。

### 2. apps/api — 型の emit

- 新規 `apps/api/tsconfig.build.json`:

```jsonc
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "noEmit": false,
    "declaration": true,
    "emitDeclarationOnly": true,
    "rootDir": ".",
    "outDir": "dist-types",
  },
  "include": ["src", "worker-configuration.d.ts"],
}
```

- `package.json` に `exports` を追加し、型の入口を1点に絞る:

```jsonc
"exports": {
  "./app-type": { "types": "./dist-types/src/index.d.ts" }
}
```

- スクリプト:
  - `"build:types": "pnpm codegen && tsc -p tsconfig.build.json"`
  - `"typecheck": "pnpm build:types"`（型チェックと d.ts 出力を兼ねる。web の typecheck より先に走る必要があるため）
  - `"build": "pnpm build:types && wrangler deploy --dry-run --outdir dist"`（`openapi` 生成を除去）
- `.gitignore` に `dist-types` を追加（既存の `dist` エントリは `wrangler deploy --dry-run` の出力用でディレクトリ名が違うため別途必要）。

### 3. apps/web — クライアントの差し替え

- `package.json`:
  - 依存追加: `"@repo/api": "workspace:*"`、`"hono": "^4.13.5"`（**api と同一バージョンにすること**。バージョン差異は "excessively deep" 型エラーの典型原因）
  - 依存削除: `openapi-fetch`、`openapi-msw`
  - `codegen`: `"tsr generate && pnpm --filter @repo/api run build:types && wrangler types"`（`openapi-typescript` の `pnpm dlx` 実行を削除）
- `src/lib/open-api/` → **`src/lib/api/`** にリネームし、`schema.gen.ts` は廃止（`.gitignore` の `schema.gen.ts` 行も削除可）。`client.ts` は:

```ts
import { hc } from "hono/client";
import type { AppType } from "@repo/api/app-type";

export const apiClient = hc<AppType>(
  import.meta.env["VITE_API_BASE_URL"] ?? `${window.location.origin}/api`,
  // MSWがfetchをパッチする前にclientが生成されても最新のfetchを使うよう遅延解決する
  { fetch: (input: RequestInfo | URL, init?: RequestInit) => globalThis.fetch(input, init) },
);
```

baseUrl が `/api`、api 側のパスがルート直下（`/products`）という現在の対応関係は `hc` でもそのまま成立する（web worker の Service Binding も vite の proxy も変更不要）。

### 4. apps/web — 呼び出し側の書き換え

`{ data, error }` を返す openapi-fetch と違い、`hc` は素の `Response`（`ClientResponse`）を返す。**ステータスで分岐 → `await res.json()`** に統一する。パスパラメータは `apiClient.products[":id"].$get({ param: { id } })`。

対象5ファイル（同一パターンの反復）:

- [query/use-product-list.ts](../../apps/web/src/features/product-management/query/use-product-list.ts) — `apiClient.products.$get()` → `res.ok` でなければ `FetchProductListError` を throw
- [query/use-product-detail.ts](../../apps/web/src/features/product-management/query/use-product-detail.ts) — `res.status === 404` で `ProductNotFoundError`、その他エラーで `FetchProductDetailError`（現行の分岐がそのまま移植できる）
- [mutation/use-create-product.ts](../../apps/web/src/features/product-management/mutation/use-create-product.ts) / [use-update-product.ts](../../apps/web/src/features/product-management/mutation/use-update-product.ts) / [use-delete-product.ts](../../apps/web/src/features/product-management/mutation/use-delete-product.ts)

入出力の型は `components["schemas"]["Xxx"]` の代わりに `hono/client` の推論ユーティリティを使う:

```ts
import type { InferRequestType, InferResponseType } from "hono/client";

type CreateProductInput = InferRequestType<typeof apiClient.products.$post>["json"];
type CreateProductOutput = InferResponseType<typeof apiClient.products.$post, 201>;
```

**維持するもの**: `read-model/`（valibot によるレスポンス検証・整形）と `port/`、`use-result-query` は transport 非依存なので変更しない。`constructProductList` / `constructProductDetail` の引数は構造的な型（`{ id: string; ... }[]`）なので `hc` の戻り値をそのまま渡せる。

### 5. apps/web — MSW

[src/lib/msw/handlers.ts](../../apps/web/src/lib/msw/handlers.ts) を素の `msw` で書き直す。パスは `/api` を含めたフルパス、レスポンスbodyだけ型付けする:

```ts
import { http, HttpResponse } from "msw";
import type { InferResponseType } from "hono/client";
import type { apiClient } from "@/lib/api/client";

type Product = InferResponseType<(typeof apiClient.products)[":id"]["$get"], 200>;

export const defaultProducts: Product[] = [/* 既存の3件をそのまま */];

export const handlers = [
  http.get("/api/products", () => HttpResponse.json(defaultProducts)),
  http.get("/api/products/:id", ({ params }) => {
    /* 404分岐は現行どおり */
  }),
  // post / put / delete も同様
];
```

ハンドラを1ファイルに集約して開発サーバー・unitテスト・Storybook の3箇所で共有する構造は変えない（[browser.ts](../../apps/web/src/lib/msw/browser.ts) / [node.ts](../../apps/web/src/lib/msw/node.ts) / `.storybook/preview.tsx` は無変更）。

### 6. CI とドキュメント

- [.github/workflows/ci.yml](../../.github/workflows/ci.yml): `pnpm --filter @repo/api run openapi` と `git diff --exit-code apps/api/openapi.json` の2ステップを削除。残りは `lint` → `format:check` → `typecheck` → `test:unit` → `build`。型の整合は `typecheck` が担保する（`pnpm -r` はワークスペース依存のトポロジカル順に走るため、`@repo/web` が `@repo/api` に依存することで api の d.ts 出力が先行する）。
- [.oxfmtrc.json](../../.oxfmtrc.json): `ignorePatterns` から `apps/api/openapi.json` を削除。
- [CLAUDE.md](../../CLAUDE.md): 「API・データフェッチ」節をOpenAPIフローからHono RPCフローに全面書き換え。`v.metadata({ ref })` の注意書き、`openapi` スクリプト、CIのopenapi検証、`schema.gen.ts` への言及を削除し、代わりに「`AppType` の export とチェーン記法が必須」「hono のバージョンを api/web で揃える」「api の `build:types` が web の型チェックの前提」を明記する。実態と食い違っている `GET /openapi.json` の記述もここで解消される。

## 既知のリスクと対処

- **`Env` の d.ts 漏れ**: `AppType` から Bindings を消しても、emit された d.ts 内には `typeof app`（= `Hono<{ Bindings: Env }, ...>`）への参照が残る。`tsconfig.base.json` の `skipLibCheck: true` により web 側で実害は出ない見込みだが、**実装時に `pnpm --filter @repo/web typecheck` とエディタ上のホバー（`AppType` が `any` になっていないか）で必ず確認する**。もし解決できない場合のフォールバックは、api 側で `Env` に依存しない `AppBindings` 型を定義して `Hono<{ Bindings: AppBindings }>` にする。
- **`hc` の型が `any` になる**: モノレポでの典型症状。原因は (a) hono のバージョン不一致、(b) `exports` の解決失敗、(c) TSサーバーの再起動忘れ、のいずれか。
- **IDEの型計算コスト**: ルート数に比例して重くなるのが Hono RPC の弱点。現状5ルートなので問題にならないが、増えたら feature 単位でサブアプリを分割する（既にその構造になっている）。TypeScript 7 系（本リポジトリは `typescript@7.0.2`）を使っている点は有利。
- **204 (delete) の扱い**: `c.body(null, 204)` の戻りは `res.json()` を呼ばずステータスだけで判定する。

## 検証

```bash
pnpm install                                   # workspace 依存の追加を反映
pnpm --filter @repo/api run build:types        # dist-types/src/index.d.ts が出力されること
pnpm typecheck                                 # api → web の順で通ること
pnpm lint && pnpm format:check
pnpm -r run test:unit                          # read-model の spec が無変更で通ること
pnpm test                                      # Storybook(play関数)も含めて通ること
pnpm build
```

エディタで `apps/web/src/lib/api/client.ts` を開き、`apiClient.products.` の補完が効くこと・`AppType` が `any` でないことを確認する。

動作確認（モック）:

```bash
pnpm dev   # 一覧 / 詳細 / 登録 / 編集 / 削除が MSW 経由で従来どおり動くこと
```

動作確認（実API）:

```bash
pnpm dev:api                      # ターミナル1
USE_MOCK=false pnpm dev           # ターミナル2
# /api/products が apps/api の GET /products に到達し、CRUD が一通り動くこと
```

本番相当（Service Binding経由）:

```bash
pnpm --filter @repo/web build && pnpm --filter @repo/web dev:worker
# / と /products/xxx の直リンクで index.html、/api/products で api Worker に到達すること
```

破壊検出の確認: api の `ProductSchema` から `imageUrl` を一時的に外し、`pnpm typecheck` が web 側でエラーを出すこと（従来 openapi.json の差分検証が担っていた役割が型で置き換わったことの確認）。
