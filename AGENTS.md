# AGENTS.md

This file provides guidance to AI coding agents (Claude Code, etc.) when working with code in this repository.

## Commands

すべて pnpm workspaces のルートから実行する（各コマンドは `-r` / `--filter` で全ワークスペースまたは個別ワークスペースに委譲される）。

```bash
pnpm install              # 依存関係のインストール
pnpm dev                  # apps/web の Vite dev server を起動
pnpm build                # 全ワークスペースをビルド（tsc -b && vite build）
pnpm typecheck             # 全ワークスペースの型チェック（tsc -b --noEmit）
pnpm test                  # 全ワークスペースのテスト（vitest run）
pnpm lint                  # oxlint によるlint（ルート実行、ワークスペース横断）
pnpm format                # oxfmt によるフォーマット
pnpm format:check          # oxfmt のフォーマットチェック（CI相当）
```

- 単一テストの実行: `pnpm --filter @repo/web exec vitest run <path>` または `pnpm --filter @repo/web exec vitest <pattern>`（watchモード）
- Storybookの起動: `pnpm --filter @repo/web storybook`（ポート6006）
- Storybookのビルド: `pnpm --filter @repo/web build-storybook`

CI（[ci.yml](.github/workflows/ci.yml)）は `lint` → `format:check` → `typecheck` → `test` → `build` の順で実行される。変更後はこの順でローカル確認するとCI通過の見込みが立てやすい。

## アーキテクチャ

pnpm workspaces によるモノレポ。ワークスペース対象は `apps/*`（[pnpm-workspace.yaml](pnpm-workspace.yaml)）で、現状 `apps/web` のみ存在する単一アプリ構成。

### apps/web の構造

- `src/features/<feature-name>/` — 機能単位のディレクトリにコンポーネントと `*.stories.tsx` を同居させる構成（例: `features/greeting-card/`, `features/a11y-demo/`）。新規機能もこのパターンに従う。
- `src/ui/` — shadcn/ui 由来の再利用可能UIプリミティブ（例: `ui/button.tsx`）。shadcn CLIで追加されるコンポーネントの置き場所（[components.json](apps/web/components.json) の `aliases.ui` 参照）。
- `src/lib/` — `lib/utils.ts` などの共通ユーティリティ。
- `src/test/setup.ts` — Vitestのグローバルセットアップ（`vite.config.ts` の `test.setupFiles` から読み込まれる）。
- パスエイリアス `@/*` は `src/*` を指す（[tsconfig.json](apps/web/tsconfig.json) と [vite.config.ts](apps/web/vite.config.ts) の両方で定義）。

### UIコンポーネントの追加

[components.json](apps/web/components.json) の設定により、shadcn CLI（`shadcn` パッケージ）経由でコンポーネントを追加する運用。style は `base-nova`、baseColorは `neutral`、アイコンは `lucide-react`。CSS変数ベースのテーマを `src/index.css` に定義。

### ビルド構成

- `tsconfig.base.json` がルートで共通のTypeScript設定（`strict`, `noUncheckedIndexedAccess`, `noUnusedLocals` など厳格めの設定）を定義し、各ワークスペースの `tsconfig.json` がこれを `extends` する。
- Vite設定（[vite.config.ts](apps/web/vite.config.ts)）は `vitest/config` の `defineConfig` を使い、Vite設定とVitest設定を1ファイルに統合している。
- Tailwind CSS v4は `@tailwindcss/vite` プラグイン経由で導入（別途のtailwind.config.jsは存在しない）。

### Lint/Format

[oxlint](https://oxc.rs/) と [oxfmt](https://oxc.rs/) を使用（ESLint/Prettierではない）。設定は [.oxlintrc.json](.oxlintrc.json)（`react`, `react-perf` プラグイン、`correctness`カテゴリをerror化）と [.oxfmtrc.json](.oxfmtrc.json)。
