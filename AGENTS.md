# AGENTS.md

This file provides guidance to AI coding agents (Claude Code, etc.) when working with code in this repository.

## Commands

すべて pnpm workspaces のルートから実行する（各コマンドは `-r` / `--filter` で全ワークスペースまたは個別ワークスペースに委譲される）。

```bash
pnpm install              # 依存関係のインストール
pnpm dev                  # apps/web の Vite dev server を起動
pnpm dev:api              # apps/api の wrangler dev を起動（http://localhost:8787）
pnpm build                # 全ワークスペースをビルド（codegen → tsc -b && vite build）
pnpm typecheck             # 全ワークスペースの型チェック（codegen → tsc -b --noEmit）
pnpm test                  # 全ワークスペースのテスト（vitest run。unit + storybook 両プロジェクト）
pnpm lint                  # oxlint によるlint（ルート実行、ワークスペース横断）
pnpm format                # oxfmt によるフォーマット
pnpm format:check          # oxfmt のフォーマットチェック（CI相当）
pnpm deploy                # apps/api → apps/web の順に wrangler deploy（Service Bindingの参照先を先に用意する必要があるため順序固定）
```

- `apps/web` の `build` / `typecheck` は事前に `codegen`（`tsr generate` によるルート生成 + `@repo/api` の `build:types` によるAPI型定義の出力 + `wrangler types` による `worker-configuration.d.ts` 生成）を実行してから本処理に入る。`build` / `typecheck` は `tsconfig.json`（`src/`）と `tsconfig.worker.json`（`worker/`）の両方を通す。
- `apps/api` の `typecheck` は `build:types`（`wrangler types` → `tsc -p tsconfig.build.json`）そのもの。型チェックと同時に `apps/web` が読む `.d.ts` を `dist-types/` に出力する。`build` は `build:types` + `wrangler deploy --dry-run`。
- `apps/web` へ渡すAPI型定義の再生成: `pnpm --filter @repo/api run build:types`
- 単一テストの実行: `pnpm --filter @repo/web exec vitest run <path>` または `pnpm --filter @repo/web exec vitest <pattern>`（watchモード）
- unitテストのみ実行（CIと同等）: `pnpm -r run test:unit`
- Storybookの起動: `pnpm --filter @repo/web storybook`（ポート6006）
- Storybookのビルド: `pnpm --filter @repo/web build-storybook`
- D1マイグレーションSQLの生成: `pnpm --filter @repo/api db:generate`（`apps/api/src/features/*/repo/table.ts` から `apps/api/drizzle/migrations/` へ。**コミットする**）
- D1マイグレーションの適用（ローカル）: `pnpm --filter @repo/api db:migrate` / （リモート）: `pnpm --filter @repo/api db:migrate:remote`（`apps/api/wrangler.jsonc` に実際の `database_id` を設定済みであることが前提。後述）
- D1へのシード投入（ローカルのみ）: `pnpm --filter @repo/api db:seed`

CI（[ci.yml](.github/workflows/ci.yml)）は `lint` → `format:check` → `typecheck` → `test:unit`（Storybookのplay関数テストは含まない） → `build` の順で実行される。api とweb の契約のズレは `typecheck` が検出する。変更後はこの順でローカル確認するとCI通過の見込みが立てやすい。

## アーキテクチャ

pnpm workspaces によるモノレポ。ワークスペース対象は `apps/*`（[pnpm-workspace.yaml](pnpm-workspace.yaml)）で、現状 `apps/web`（React SPA）と `apps/api`（Cloudflare Workers 上の Hono APIサーバー）の2つ。両者は **Hono RPC の型（`apps/api` が export する `AppType`）だけを介して繋がる**（ランタイムコードの共有はしない）。

### apps/api の構造

- `src/index.ts` — Workerのエントリ。`export default app`（Honoの`.fetch`）。`new Hono<{ Bindings: Env }>()` で D1 などのバインディング型を通し、feature単位のサブアプリを `.route("/", ...)` でマウントする。**チェーンで書くこと**（`app.route(...)` を別行にするとRPCの型が落ちる）。あわせて `apps/web` に渡す `AppType` を export する。`Hono<BlankEnv, ExtractSchema<typeof app>, "/">` としてBindings（`Env`）を落とし、Workers固有のグローバル型がweb側に漏れないようにしている。
- `src/lib/db.ts` — `createDb(d1: D1Database)` で `drizzle-orm/d1` の `Db` インスタンスを組み立てる薄いラッパー。
- `src/features/<feature-name>/` — `route.ts`（Honoのサブアプリ。`new Hono<{ Bindings: Env }>()`。各ハンドラの冒頭で `createProductRepo(createDb(c.env.DB))` のように repo を組み立てて usecase に渡す composition root）、`usecase/`（ユースケース単位に1ファイル。例: `get-product-list.ts`, `create-product.ts`。第1引数で `ProductRepo` を受け取る async 関数。`domain/` と `repo/` を呼び出し、DTOへの詰め替えを担う。`schema.ts` もここに置く。valibotスキーマとDTO型 `XxxDTO` を定義）、`domain/`（ドメインモデル。`product.ts` にエンティティ本体を関数型・不変オブジェクトで表現し、`ports.ts` に `FindById`/`Save` のような repo 操作の関数型シグネチャ（戻り値は `Promise`）と `ProductRepo` 型、`TaggedError`（`better-result`）による `XxxNotFoundError` などのエラー型を定義する。Cloudflare / Drizzle の型には依存させない）、`repo/`（データアクセス。Drizzle ORM 経由の D1。`table.ts` にテーブル定義（`drizzle-kit` の `schema` glob 対象）、操作単位に1ファイル（`findAll.ts`, `findById.ts`, `save.ts`, `remove.ts`）で `(db: Db) => Port` のファクトリとして実装し、not foundなどはドメインのエラー型を返す。`index.ts` の `createProductRepo(db)` が feature 単位の composition root）の構成。`apps/web` の feature ディレクトリ規約に揃えている。
- `wrangler.jsonc` — Cloudflare Workers の設定。`d1_databases` で D1 バインディング（`binding: "DB"`）を定義する。`database_id` は実際のCloudflare D1データベースのUUIDを**直接コミットする**（UUID自体は秘匿情報ではなく、操作にはCloudflareアカウントの認証情報が別途必要なため）。`wrangler types` が `worker-configuration.d.ts`（gitignore対象）を生成し、`Env.DB: D1Database` を含むWorkersのランタイム型を供給する。`tsconfig.json` では `lib` から `DOM` を外している。
- `tsconfig.build.json` — `apps/web` に渡す型定義の出力設定（`emitDeclarationOnly` で `dist-types/` へ）。`package.json` の `exports["./app-type"]` がその入口で、web は `@repo/api/app-type` から `AppType` を type-only import する。
- `drizzle.config.ts` / `drizzle/migrations/` — `drizzle-kit generate` が `src/features/*/repo/table.ts` から読み取ってマイグレーションSQLを `drizzle/migrations/` に出力する（**コミットする**）。適用は `wrangler d1 migrations apply` 側で行うため `driver: "d1-http"` は付けない（Cloudflare APIトークン不要）。
- `drizzle/seed.sql` — ローカル開発用の初期データ（`INSERT OR IGNORE`）。マイグレーションには含めず、`db:seed` で別途投入する。リモートには流し込まない。

### apps/web の構造

- `src/features/<feature-name>/` — 機能単位のディレクトリに、`components/`（コンポーネントと `*.stories.tsx`）、`query/`（TanStack Queryの `useQuery` カスタムフック）、`mutation/`（TanStack Queryの `useMutation` カスタムフック）、`read-model/`（valibotでのスキーマ検証・整形ロジックとその `*.spec.ts`）などのサブディレクトリを持つ構成（例: `features/product-management/`）。新規機能もこのパターンに従う。
- `src/routes/` — TanStack Routerのファイルベースルーティング定義（`__root.tsx` がルートレイアウト）。ここから `routeTree.gen.ts` が自動生成されるため、生成物は直接編集しない。
- `src/ui/` — shadcn/ui 由来の再利用可能UIプリミティブ（例: `ui/button.tsx`）。shadcn CLIで追加されるコンポーネントの置き場所（[components.json](apps/web/components.json) の `aliases.ui` 参照）。
- `src/lib/api/client.ts` — `hono/client` の `hc<AppType>` で作るRPCクライアント（`apiClient`）。型は `@repo/api/app-type` から直接受け取るのでコード生成物は無い。
- `src/lib/msw/` — MSWのリクエストハンドラ（`handlers.ts`。素の `msw` で定義し、レスポンスの形だけ `InferResponseType` でAPIの型に縛る）と、Node向け（`node.ts`、Vitestのunitテストで使用）・ブラウザ向け（`browser.ts`、`dev-entry.ts` 経由で開発サーバーとStorybookが使用）のセットアップ。ハンドラは1箇所（`handlers.ts`）に定義し、開発サーバー・テスト・Storybookの3箇所で共有する。
- `src/lib/utils.ts` — `cn()` などの共通ユーティリティ。
- `src/dev-entry.ts` — 開発サーバー起動時にMSWのService Workerを起動してから `main.tsx` を読み込むエントリポイント。`vite.config.ts` の `dev-entry` プラグインが `USE_MOCK=false` でない限り `index.html` の読み込み先をこちらに差し替える。
- `src/test/setup.ts` — Vitestの `unit` プロジェクト向けグローバルセットアップ（MSWサーバーの起動/リセット/終了、Testing Libraryの `cleanup`）。
- パスエイリアス `@/*` は `src/*` を指す（[tsconfig.json](apps/web/tsconfig.json) と [vite.config.ts](apps/web/vite.config.ts) の両方で定義）。
- `worker/index.ts` — 本番デプロイ用のCloudflare Workerエントリ。`/api/*` をprefixを剥がした上でService Binding（`env.API`）経由で `apps/api` Workerへ転送し、それ以外は `env.ASSETS`（Vite の `dist` をビルドしたStatic Assets）へ委譲する薄い実装。開発サーバー（`pnpm dev`）はこのWorkerを経由せず、`vite.config.ts` の `server.proxy` を使う。
- `wrangler.jsonc` — `apps/web` Worker（`template-monorepo-web`）の設定。`assets.directory` が `dist`、`services[0].service` は `apps/api` の `wrangler.jsonc` の `name`（`template-monorepo-api`）と一致させる必要がある。`assets.run_worker_first: ["/api/*"]` が無いとSPAフォールバックが先に効いて `/api/*` にも `index.html` が返り、Workerまで到達しない。
- `tsconfig.worker.json` — `worker/` 用の型チェック専用tsconfig。DOM libを含む `tsconfig.json`（`src/` 用）とは分離し、`apps/api/tsconfig.json` と同じ方針でWorkersランタイム型（`worker-configuration.d.ts`）のみを使う。`codegen` の `wrangler types` が生成する。

### API・データフェッチ

型は **`apps/api` の実装 → `apps/api/dist-types/`（`.d.ts`） → `apps/web`** という一方向で流れる。契約ファイルもコード生成物も無く、api側の変更は `pnpm typecheck` がそのままweb側の型エラーとして検出する。

1. `apps/api/src/features/<name>/schema.ts` にvalibotスキーマを定義し、`route.ts` の `sValidator`（`@hono/standard-validator`）に渡す。
2. `pnpm --filter @repo/api run build:types`（`pnpm typecheck` や web の `codegen` からも自動実行）で `dist-types/` を更新する。
3. `apps/web` は `@/lib/api/client` の `apiClient` から補完付きで呼ぶ。

- **ルートはメソッドチェーンで定義する**（[route.ts](apps/api/src/features/product-management/route.ts) 参照）。途中で変数に受け直すとRPCの型が落ちる。同様に `apps/api/src/index.ts` の `.route()` もチェーンで書く。
- **ステータスコードを明示する**（`c.json(product, 200)` / `c.json(x, 201)`）。クライアント側は `res.status` で分岐して `await res.json()` の型をナローイングするため、省略すると型が絞れない。
- ルートのパスは `apps/api` 側では**ルート直下**（`/products`）に定義する。`apiClient` の baseUrl（`origin + /api`）が `/api` を前置する前提のため、api側に `basePath("/api")` を付けると二重になる。
- バリデーション失敗時はデフォルトだとvalibotのissueがそのまま返るため、`sValidator` の第3引数のhookで `{ message }` の形に揃える（`param` バリデータにも付けて400のレスポンス形を統一する）。
- **`hono` のバージョンは `apps/api` と `apps/web` で揃える**。ズレると "excessively deep" 型エラーや型が `any` に落ちる原因になる。`AppType` の補完が効かなくなったときは、バージョン差異・`dist-types/` の未生成・TSサーバーの再起動忘れをこの順で疑う。
- APIアクセスは `apiClient` 経由で行い、TanStack Queryの `useQuery`/`useMutation` でラップする（`features/<name>/query/` `mutation/` 配下）。リクエスト/レスポンスの型は `hono/client` の `InferRequestType` / `InferResponseType` から引く。
- APIレスポンスの検証・変形はvalibotのスキーマを `features/<name>/read-model/` に定義し、`safeParse` で行う（transport非依存の層なのでRPCの型とは独立している）。
- モックは `src/lib/msw/handlers.ts` に素の `msw` の `http` ヘルパーで定義する（パスは `/api` を含めたフルパス）。開発サーバー（`dev-entry.ts` → `browser.ts`）、Vitestのunitテスト（`test/setup.ts` → `node.ts`）、Storybook（`.storybook/preview.tsx` の `msw-storybook-addon`）が同じハンドラを参照するため、実装より先にハンドラを追加/更新すると三箇所に反映される。

### 実APIに繋いで動かす

デフォルトの `pnpm dev` はMSWのモックを使う。実際の `apps/api` に繋ぐ場合、初回はローカルD1の初期化が必要:

```bash
pnpm --filter @repo/api db:generate    # 初回のみ（migrations/0000_*.sql が既にあれば不要）
pnpm --filter @repo/api db:migrate     # ローカルD1（.wrangler/state 配下）にテーブル作成
pnpm --filter @repo/api db:seed        # 商品3件を投入
```

```bash
pnpm dev:api                    # ターミナル1: wrangler dev (http://localhost:8787)
USE_MOCK=false pnpm dev         # ターミナル2: MSWを止めてViteのproxy経由でapps/apiへ
```

`apps/web/vite.config.ts` の `server.proxy` が `/api` を `http://localhost:8787` に転送し、`/api` プレフィックスを剥がす。転送先は `VITE_API_PROXY_TARGET` で差し替えられる。Storybookとunitテストは常にMSWを使う。

### デプロイ

本番では `apps/web` もCloudflare Worker（Static Assets + `worker/index.ts`）としてデプロイし、`/api/*` をService Binding経由で `apps/api` Workerへ転送する。同一オリジンの `/api` が成立するため、`apiClient` の既定baseURL（`${window.location.origin}/api`）がそのまま使え、CORSに依存しない。

本番相当の動作確認（ローカルで両Workerを同時起動）:

```bash
pnpm --filter @repo/web build
pnpm --filter @repo/web dev:worker   # web worker + api worker (auxiliary) を同時起動
```

- `/` やクライアントルーティング先の直リンク（例 `/products/xxx`）でSPAフォールバック（`index.html`）が返ること
- `/api/products` が `apps/api` の `GET /products` に到達すること（`run_worker_first` が効いていない場合、ここでもindex.htmlが返る）

初回のみ、D1データベースの実体をCloudflare上に作成する:

```bash
pnpm --filter @repo/api exec wrangler d1 create template-monorepo-db
# 出力された database_id を apps/api/wrangler.jsonc の d1_databases[].database_id に直接書き込む
```

`database_id` はUUIDでありCloudflareアカウントの認証情報（`wrangler login` の認証情報やAPIトークン）が無ければ操作できないため、`wrangler.jsonc` に直接コミットしてよい（`d1_databases[].database_id` はwranglerがバインディング解決に使う静的な設定値であり、`${VAR}` 展開にもsecrets/vars（`wrangler secret put` など、いずれもWorkerの実行時に `env.XXX` として参照する値専用の仕組み）にも対応しない）。

```bash
pnpm --filter @repo/api db:migrate:remote   # リモートD1にマイグレーション適用
```

デプロイ:

```bash
pnpm --filter @repo/api deploy
pnpm --filter @repo/web build && pnpm --filter @repo/web deploy
# または pnpm deploy（api → web の順で実行）
```

`apps/web/wrangler.jsonc` の `services[0].service` は `apps/api/wrangler.jsonc` の `name`（`template-monorepo-api`）と一致させる必要がある。Service Bindingは同一Cloudflareアカウント内のWorker名で解決されるため、apps/apiを先にデプロイしておくこと。

### UIコンポーネントの追加

[components.json](apps/web/components.json) の設定により、shadcn CLI（`shadcn` パッケージ）経由でコンポーネントを追加する運用。style は `base-nova`、baseColorは `neutral`、アイコンは `lucide-react`。CSS変数ベースのテーマを `src/index.css` に定義。テーブルはshadcn/uiのDataTableパターンでTanStack Tableを利用する（`features/<name>/components/*-table/` 参照）。

### ビルド構成

- `tsconfig.base.json` がルートで共通のTypeScript設定（`strict`, `noUncheckedIndexedAccess`, `noUnusedLocals` など厳格めの設定）を定義し、各ワークスペースの `tsconfig.json` がこれを `extends` する。
- Vite設定（[vite.config.ts](apps/web/vite.config.ts)）は `vitest/config` の `defineConfig` を使い、Vite設定とVitest設定を1ファイルに統合している。`test.projects` で `unit`（jsdom）と `storybook`（`@storybook/addon-vitest` + Playwright経由の実Chromiumで各Storyをテストとして実行）の2プロジェクトに分割している。
- Tailwind CSS v4は `@tailwindcss/vite` プラグイン経由で導入（別途のtailwind.config.jsは存在しない）。

### Lint/Format

[oxlint](https://oxc.rs/) と [oxfmt](https://oxc.rs/) を使用（ESLint/Prettierではない）。設定は [.oxlintrc.json](.oxlintrc.json)（`react`, `react-perf` プラグイン、`correctness`カテゴリをerror化）と [.oxfmtrc.json](.oxfmtrc.json)。
