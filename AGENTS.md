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

- `apps/web` の `build` / `typecheck` は事前に `codegen`（`tsr generate` によるルート生成 + `openapi-typescript` による `apps/api/openapi.json` からの型生成 + `wrangler types` による `worker-configuration.d.ts` 生成）を実行してから本処理に入る。`build` / `typecheck` は `tsconfig.json`（`src/`）と `tsconfig.worker.json`（`worker/`）の両方を通す。
- `apps/api` の `typecheck` は事前に `codegen`（`wrangler types` による `worker-configuration.d.ts` 生成）を実行する。`build` は `openapi.json` の再生成 + `wrangler deploy --dry-run`。
- OpenAPIスキーマの再生成: `pnpm --filter @repo/api run openapi`
- 単一テストの実行: `pnpm --filter @repo/web exec vitest run <path>` または `pnpm --filter @repo/web exec vitest <pattern>`（watchモード）
- unitテストのみ実行（CIと同等）: `pnpm -r run test:unit`
- Storybookの起動: `pnpm --filter @repo/web storybook`（ポート6006）
- Storybookのビルド: `pnpm --filter @repo/web build-storybook`

CI（[ci.yml](.github/workflows/ci.yml)）は `lint` → `format:check` → `typecheck` → `openapi`再生成 → `git diff --exit-code apps/api/openapi.json` → `test:unit`（Storybookのplay関数テストは含まない） → `build` の順で実行される。変更後はこの順でローカル確認するとCI通過の見込みが立てやすい。

## アーキテクチャ

pnpm workspaces によるモノレポ。ワークスペース対象は `apps/*`（[pnpm-workspace.yaml](pnpm-workspace.yaml)）で、現状 `apps/web`（React SPA）と `apps/api`（Cloudflare Workers 上の Hono APIサーバー）の2つ。両者はコード共有をせず、**OpenAPIスキーマ（`apps/api/openapi.json`）だけを介して繋がる**。

### apps/api の構造

- `src/index.ts` — Workerのエントリ。`export default app`（Honoの`.fetch`）。CORSを有効化し、feature単位のサブアプリを `app.route("/", ...)` でマウントする。動作確認用に `GET /openapi.json` も生やしている。
- `src/openapi.ts` — OpenAPIドキュメントのメタ情報（`info` など）。実行時のエンドポイントと生成スクリプトの双方が参照する。
- `src/features/<feature-name>/` — `schema.ts`（valibotスキーマ）、`route.ts`（Honoのサブアプリ）、`repository.ts`（データアクセス。現状はインメモリ）、`*.spec.ts` の構成。`apps/web` の feature ディレクトリ規約に揃えている。
- `scripts/generate-openapi.ts` — `hono-openapi` の `generateSpecs()` でスキーマを組み立て `openapi.json` に書き出す。サーバー起動は不要。
- `wrangler.jsonc` — Cloudflare Workers の設定。`wrangler types` が `worker-configuration.d.ts`（gitignore対象）を生成し、Workersのランタイム型を供給する。`tsconfig.json` では `lib` から `DOM` を外している。

### apps/web の構造

- `src/features/<feature-name>/` — 機能単位のディレクトリに、`components/`（コンポーネントと `*.stories.tsx`）、`query/`（TanStack Queryの `useQuery` カスタムフック）、`mutation/`（TanStack Queryの `useMutation` カスタムフック）、`read-model/`（valibotでのスキーマ検証・整形ロジックとその `*.spec.ts`）などのサブディレクトリを持つ構成（例: `features/product-management/`）。新規機能もこのパターンに従う。
- `src/routes/` — TanStack Routerのファイルベースルーティング定義（`__root.tsx` がルートレイアウト）。ここから `routeTree.gen.ts` が自動生成されるため、生成物は直接編集しない。
- `src/ui/` — shadcn/ui 由来の再利用可能UIプリミティブ（例: `ui/button.tsx`）。shadcn CLIで追加されるコンポーネントの置き場所（[components.json](apps/web/components.json) の `aliases.ui` 参照）。
- `src/lib/open-api/` — `apps/api/openapi.json` から生成される型定義 `schema.gen.ts`（コミット対象外、`codegen` で再生成）と、それを使う `openapi-fetch` クライアント（`client.ts`）。
- `src/lib/msw/` — MSWのリクエストハンドラ（`handlers.ts`。`openapi-msw` で `schema.gen.ts` の型を使い定義）と、Node向け（`node.ts`、Vitestのunitテストで使用）・ブラウザ向け（`browser.ts`、`dev-entry.ts` 経由で開発サーバーとStorybookが使用）のセットアップ。ハンドラは1箇所（`handlers.ts`）に定義し、開発サーバー・テスト・Storybookの3箇所で共有する。
- `src/lib/utils.ts` — `cn()` などの共通ユーティリティ。
- `src/dev-entry.ts` — 開発サーバー起動時にMSWのService Workerを起動してから `main.tsx` を読み込むエントリポイント。`vite.config.ts` の `dev-entry` プラグインが `USE_MOCK=false` でない限り `index.html` の読み込み先をこちらに差し替える。
- `src/test/setup.ts` — Vitestの `unit` プロジェクト向けグローバルセットアップ（MSWサーバーの起動/リセット/終了、Testing Libraryの `cleanup`）。
- パスエイリアス `@/*` は `src/*` を指す（[tsconfig.json](apps/web/tsconfig.json) と [vite.config.ts](apps/web/vite.config.ts) の両方で定義）。
- `worker/index.ts` — 本番デプロイ用のCloudflare Workerエントリ。`/api/*` をprefixを剥がした上でService Binding（`env.API`）経由で `apps/api` Workerへ転送し、それ以外は `env.ASSETS`（Vite の `dist` をビルドしたStatic Assets）へ委譲する薄い実装。開発サーバー（`pnpm dev`）はこのWorkerを経由せず、`vite.config.ts` の `server.proxy` を使う。
- `wrangler.jsonc` — `apps/web` Worker（`template-monorepo-web`）の設定。`assets.directory` が `dist`、`services[0].service` は `apps/api` の `wrangler.jsonc` の `name`（`template-monorepo-api`）と一致させる必要がある。`assets.run_worker_first: ["/api/*"]` が無いとSPAフォールバックが先に効いて `/api/*` にも `index.html` が返り、Workerまで到達しない。
- `tsconfig.worker.json` — `worker/` 用の型チェック専用tsconfig。DOM libを含む `tsconfig.json`（`src/` 用）とは分離し、`apps/api/tsconfig.json` と同じ方針でWorkersランタイム型（`worker-configuration.d.ts`）のみを使う。`codegen` の `wrangler types` が生成する。

### API・データフェッチ

スキーマは **`apps/api` の実装 → `apps/api/openapi.json` → `apps/web` の `schema.gen.ts`** という一方向で流れる。`openapi.json` を手で編集してはいけない。

1. `apps/api/src/features/<name>/schema.ts` にvalibotスキーマを定義し、`route.ts` の `describeRoute` / `resolver` / `validator` に渡す。
2. `pnpm --filter @repo/api run openapi` で `apps/api/openapi.json` を再生成し、**コミットする**（CIが再生成して差分が出ないことを検証する）。
3. `pnpm --filter @repo/web codegen`（`build`/`typecheck` からも自動実行）で `openapi-typescript` により `apps/web/src/lib/open-api/schema.gen.ts` を生成する。

- **`components.schemas` に名前付きで載せたいスキーマには `v.metadata({ ref: "Xxx" })` を付ける**（例: `v.pipe(v.object({...}), v.metadata({ ref: "Product" }))`）。これが無いとスキーマがインライン展開され、web側の `components["schemas"]["Xxx"]` が生成されない。`ref` 名のリネームはweb側の破壊的変更になる。
- ルートのパスは `apps/api` 側では**ルート直下**（`/products`）に定義する。`apps/web` の `apiClient`（baseUrl = `origin + /api`）とMSW（`baseUrl: "/api"`）がスキーマ上のパスに `/api` を前置する前提のため、api側に `basePath("/api")` を付けると二重になる。
- Honoの `:id` 記法は生成時に自動的にOpenAPIの `{id}` へ変換される。
- バリデーション失敗時はデフォルトだとvalibotのissueがそのまま返るため、`validator` の第3引数のhookで `Error` スキーマの形（`{ message }`）に揃える。
- APIアクセスは `src/lib/open-api/client.ts` の `apiClient`（`openapi-fetch`）経由で行い、TanStack Queryの `useQuery`/`useMutation` でラップする（`features/<name>/query/` 配下）。
- APIレスポンスの検証・変形はvalibotのスキーマを `features/<name>/read-model/` に定義し、`safeParse` で行う。
- モックは `src/lib/msw/handlers.ts` に `openapi-msw` の `http` ヘルパーで定義する。開発サーバー（`dev-entry.ts` → `browser.ts`）、Vitestのunitテスト（`test/setup.ts` → `node.ts`）、Storybook（`.storybook/preview.tsx` の `msw-storybook-addon`）が同じハンドラを参照するため、実装より先にハンドラを追加/更新すると三箇所に反映される。

### 実APIに繋いで動かす

デフォルトの `pnpm dev` はMSWのモックを使う。実際の `apps/api` に繋ぐ場合:

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

[oxlint](https://oxc.rs/) と [oxfmt](https://oxc.rs/) を使用（ESLint/Prettierではない）。設定は [.oxlintrc.json](.oxlintrc.json)（`react`, `react-perf` プラグイン、`correctness`カテゴリをerror化）と [.oxfmtrc.json](.oxfmtrc.json)。生成物である `apps/api/openapi.json` はoxfmtの対象外にしている（フォーマットすると再生成のたびに差分が出るため）。
