# template-monorepo-react

pnpm workspaces によるモノレポの最小構成テンプレート。

## 構成

```
apps/
  web/    Vite + React + TypeScript
```

- パッケージマネージャ: pnpm
- Lint / Format: [oxlint](https://oxc.rs/) / [oxfmt](https://oxc.rs/)

### apps/web

- [Vite](https://vite.dev/) + [React](https://react.dev/) + TypeScript
- ルーティング: [TanStack Router](https://tanstack.com/router)（`@tanstack/router-plugin` によるファイルベースルーティング、`src/routes/` 配下から `routeTree.gen.ts` を自動生成）
- データフェッチ: [TanStack Query](https://tanstack.com/query) + [openapi-fetch](https://openapi-ts.dev/openapi-fetch/)（`openapi/schema.yaml` から `openapi-typescript` で型を生成し、型安全なAPIクライアントとして利用）
- テーブル: [TanStack Table](https://tanstack.com/table)（`shadcn/ui` のDataTableパターンで利用）
- スキーマ検証: [valibot](https://valibot.dev/)
- APIモック: [MSW](https://mswjs.io/)（開発サーバー・テスト・Storybookの3箇所で同じハンドラを共有）
- スタイリング: [Tailwind CSS](https://tailwindcss.com/)
- UIコンポーネント: [shadcn/ui](https://ui.shadcn.com/)（[base-ui](https://base-ui.com/) ベース）
- テスト: [Vitest](https://vitest.dev/)（`unit` プロジェクトはjsdom、`storybook` プロジェクトは[Playwright](https://playwright.dev/)経由の実Chromiumで実行） + [Testing Library](https://testing-library.com/)
- コンポーネントカタログ: [Storybook](https://storybook.js.org/)（a11y / vitest / docs アドオン、msw-storybook-addon導入済み）

## ローカルでの動かし方

```bash
pnpm install
pnpm dev
```

- `pnpm lint` — oxlintでlint
- `pnpm format` / `pnpm format:check` — oxfmtでフォーマット / チェック
- `pnpm typecheck` — 各ワークスペースの型チェック（内部で `openapi/schema.yaml` からの型生成を実行）
- `pnpm build` — 各ワークスペースのビルド
- `pnpm test` — 各ワークスペースのテスト（Vitestの `unit` + `storybook` プロジェクトを実行。CIでは `unit` のみ実行）
- `pnpm --filter @repo/web storybook` — Storybookの起動
