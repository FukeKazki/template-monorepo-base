# AGENTS.md

This file provides guidance to AI coding agents (Claude Code, etc.) when working with code in this repository.

## Commands

すべて pnpm workspaces のルートから実行する（各コマンドは `-r` / `--filter` で全ワークスペースまたは個別ワークスペースに委譲される）。

```bash
pnpm install              # 依存関係のインストール
pnpm dev                  # apps/web の Vite dev server を起動
pnpm build                # 全ワークスペースをビルド（codegen → tsc -b && vite build）
pnpm typecheck             # 全ワークスペースの型チェック（codegen → tsc -b --noEmit）
pnpm test                  # 全ワークスペースのテスト（vitest run。unit + storybook 両プロジェクト）
pnpm lint                  # oxlint によるlint（ルート実行、ワークスペース横断）
pnpm format                # oxfmt によるフォーマット
pnpm format:check          # oxfmt のフォーマットチェック（CI相当）
```

- `apps/web` の `build` / `typecheck` は事前に `codegen`（`tsr generate` によるルート生成 + `openapi-typescript` による `openapi/schema.yaml` からの型生成）を実行してから本処理に入る。
- 単一テストの実行: `pnpm --filter @repo/web exec vitest run <path>` または `pnpm --filter @repo/web exec vitest <pattern>`（watchモード）
- unitテストのみ実行（CIと同等）: `pnpm --filter @repo/web run test:unit`
- Storybookの起動: `pnpm --filter @repo/web storybook`（ポート6006）
- Storybookのビルド: `pnpm --filter @repo/web build-storybook`

CI（[ci.yml](.github/workflows/ci.yml)）は `lint` → `format:check` → `typecheck` → `test:unit`（`@repo/web` のみ、Storybookのplay関数テストは含まない） → `build` の順で実行される。変更後はこの順でローカル確認するとCI通過の見込みが立てやすい。

## アーキテクチャ

pnpm workspaces によるモノレポ。ワークスペース対象は `apps/*`（[pnpm-workspace.yaml](pnpm-workspace.yaml)）で、現状 `apps/web` のみ存在する単一アプリ構成。

### apps/web の構造

- `src/features/<feature-name>/` — 機能単位のディレクトリに、`components/`（コンポーネントと `*.stories.tsx`）、`query/`（TanStack Queryの `useQuery` カスタムフック）、`mutation/`（TanStack Queryの `useMutation` カスタムフック）、`read-model/`（valibotでのスキーマ検証・整形ロジックとその `*.spec.ts`）などのサブディレクトリを持つ構成（例: `features/product-management/`）。新規機能もこのパターンに従う。
- `src/routes/` — TanStack Routerのファイルベースルーティング定義（`__root.tsx` がルートレイアウト）。ここから `routeTree.gen.ts` が自動生成されるため、生成物は直接編集しない。
- `src/ui/` — shadcn/ui 由来の再利用可能UIプリミティブ（例: `ui/button.tsx`）。shadcn CLIで追加されるコンポーネントの置き場所（[components.json](apps/web/components.json) の `aliases.ui` 参照）。
- `src/lib/open-api/` — `openapi/schema.yaml` から生成される型定義 `schema.gen.ts`（コミット対象外、`codegen` で再生成）と、それを使う `openapi-fetch` クライアント（`client.ts`）。
- `src/lib/msw/` — MSWのリクエストハンドラ（`handlers.ts`。`openapi-msw` で `schema.gen.ts` の型を使い定義）と、Node向け（`node.ts`、Vitestのunitテストで使用）・ブラウザ向け（`browser.ts`、`dev-entry.ts` 経由で開発サーバーとStorybookが使用）のセットアップ。ハンドラは1箇所（`handlers.ts`）に定義し、開発サーバー・テスト・Storybookの3箇所で共有する。
- `src/lib/utils.ts` — `cn()` などの共通ユーティリティ。
- `src/dev-entry.ts` — 開発サーバー起動時にMSWのService Workerを起動してから `main.tsx` を読み込むエントリポイント。`vite.config.ts` の `dev-entry` プラグインが `USE_MOCK=false` でない限り `index.html` の読み込み先をこちらに差し替える。
- `src/test/setup.ts` — Vitestの `unit` プロジェクト向けグローバルセットアップ（MSWサーバーの起動/リセット/終了、Testing Libraryの `cleanup`）。
- パスエイリアス `@/*` は `src/*` を指す（[tsconfig.json](apps/web/tsconfig.json) と [vite.config.ts](apps/web/vite.config.ts) の両方で定義）。

### API・データフェッチ

- `openapi/schema.yaml` がAPIスキーマの正（OpenAPI）。`pnpm --filter @repo/web codegen`（`build`/`typecheck` からも自動実行）で `openapi-typescript` により `src/lib/open-api/schema.gen.ts` を生成する。スキーマ変更時はこのファイルを更新してから型を再生成する。
- APIアクセスは `src/lib/open-api/client.ts` の `apiClient`（`openapi-fetch`）経由で行い、TanStack Queryの `useQuery`/`useMutation` でラップする（`features/<name>/query/` 配下）。
- APIレスポンスの検証・変形はvalibotのスキーマを `features/<name>/read-model/` に定義し、`safeParse` で行う。
- モックは `src/lib/msw/handlers.ts` に `openapi-msw` の `http` ヘルパーで定義する。開発サーバー（`dev-entry.ts` → `browser.ts`）、Vitestのunitテスト（`test/setup.ts` → `node.ts`）、Storybook（`.storybook/preview.tsx` の `msw-storybook-addon`）が同じハンドラを参照するため、実装より先にハンドラを追加/更新すると三箇所に反映される。

### UIコンポーネントの追加

[components.json](apps/web/components.json) の設定により、shadcn CLI（`shadcn` パッケージ）経由でコンポーネントを追加する運用。style は `base-nova`、baseColorは `neutral`、アイコンは `lucide-react`。CSS変数ベースのテーマを `src/index.css` に定義。テーブルはshadcn/uiのDataTableパターンでTanStack Tableを利用する（`features/<name>/components/*-table/` 参照）。

### ビルド構成

- `tsconfig.base.json` がルートで共通のTypeScript設定（`strict`, `noUncheckedIndexedAccess`, `noUnusedLocals` など厳格めの設定）を定義し、各ワークスペースの `tsconfig.json` がこれを `extends` する。
- Vite設定（[vite.config.ts](apps/web/vite.config.ts)）は `vitest/config` の `defineConfig` を使い、Vite設定とVitest設定を1ファイルに統合している。`test.projects` で `unit`（jsdom）と `storybook`（`@storybook/addon-vitest` + Playwright経由の実Chromiumで各Storyをテストとして実行）の2プロジェクトに分割している。
- Tailwind CSS v4は `@tailwindcss/vite` プラグイン経由で導入（別途のtailwind.config.jsは存在しない）。

### Lint/Format

[oxlint](https://oxc.rs/) と [oxfmt](https://oxc.rs/) を使用（ESLint/Prettierではない）。設定は [.oxlintrc.json](.oxlintrc.json)（`react`, `react-perf` プラグイン、`correctness`カテゴリをerror化）と [.oxfmtrc.json](.oxfmtrc.json)。
