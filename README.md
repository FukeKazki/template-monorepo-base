# template-monorepo-react

pnpm workspaces によるモノレポの最小構成テンプレート。

## 構成

```
apps/
  web/    Vite + React + TypeScript（Cloudflare Workers Static Assets としてもデプロイ可能）
  api/    Hono + Cloudflare Workers
```

- パッケージマネージャ: pnpm
- Lint / Format: [oxlint](https://oxc.rs/) / [oxfmt](https://oxc.rs/)
- `apps/web` と `apps/api` はコードを共有せず、`apps/api/openapi.json`（OpenAPIスキーマ）だけを介して繋がる

### apps/web

- [Vite](https://vite.dev/) + [React](https://react.dev/) + TypeScript
- ルーティング: [TanStack Router](https://tanstack.com/router)（`@tanstack/router-plugin` によるファイルベースルーティング、`src/routes/` 配下から `routeTree.gen.ts` を自動生成）
- データフェッチ: [TanStack Query](https://tanstack.com/query) + [openapi-fetch](https://openapi-ts.dev/openapi-fetch/)（`apps/api/openapi.json` から `openapi-typescript` で型を生成し、型安全なAPIクライアントとして利用）
- テーブル: [TanStack Table](https://tanstack.com/table)（`shadcn/ui` のDataTableパターンで利用）
- スキーマ検証: [valibot](https://valibot.dev/)
- APIモック: [MSW](https://mswjs.io/)（開発サーバー・テスト・Storybookの3箇所で同じハンドラを共有）
- スタイリング: [Tailwind CSS](https://tailwindcss.com/)
- UIコンポーネント: [shadcn/ui](https://ui.shadcn.com/)（[base-ui](https://base-ui.com/) ベース）
- テスト: [Vitest](https://vitest.dev/)（`unit` プロジェクトはjsdom、`storybook` プロジェクトは[Playwright](https://playwright.dev/)経由の実Chromiumで実行） + [Testing Library](https://testing-library.com/)
- コンポーネントカタログ: [Storybook](https://storybook.js.org/)（a11y / vitest / docs アドオン、msw-storybook-addon導入済み）
- 本番デプロイ: Cloudflare Workers（Static Assets + `worker/index.ts` の薄いエントリ）

### apps/api

- [Hono](https://hono.dev/) を使った [Cloudflare Workers](https://workers.cloudflare.com/) 上のAPIサーバー
- スキーマ検証: [valibot](https://valibot.dev/)
- OpenAPIドキュメント生成: [hono-openapi](https://github.com/rhinobase/hono-openapi)（`scripts/generate-openapi.ts` で `openapi.json` を出力し、コミット対象とする）

## ローカルでの動かし方

```bash
pnpm install
pnpm dev                        # apps/web の Vite dev server（デフォルトはMSWモック）
```

実際の `apps/api` に繋ぐ場合:

```bash
pnpm dev:api                    # ターミナル1: wrangler dev (http://localhost:8787)
USE_MOCK=false pnpm dev         # ターミナル2: MSWを止めてViteのproxy経由でapps/apiへ
```

- `pnpm lint` — oxlintでlint
- `pnpm format` / `pnpm format:check` — oxfmtでフォーマット / チェック
- `pnpm typecheck` — 各ワークスペースの型チェック（内部で `apps/api/openapi.json` からの型生成を実行）
- `pnpm build` — 各ワークスペースのビルド
- `pnpm test` — 各ワークスペースのテスト（Vitestの `unit` + `storybook` プロジェクトを実行。CIでは `unit` のみ実行）
- `pnpm --filter @repo/web storybook` — Storybookの起動

## デプロイ

`apps/web` / `apps/api` とも Cloudflare Workers 上にデプロイする。`apps/web` は `/api/*` をService Binding経由で `apps/api` Workerへ転送するため、同一オリジンの `/api` として本番でもAPIにアクセスできる（CORS不要）。

```bash
pnpm deploy    # apps/api → apps/web の順に wrangler deploy
```

詳細は [AGENTS.md](AGENTS.md) の「デプロイ」セクションを参照。
