# template-monorepo-base

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
- スタイリング: [Tailwind CSS](https://tailwindcss.com/)
- UIコンポーネント: [shadcn/ui](https://ui.shadcn.com/)（[base-ui](https://base-ui.com/) ベース）
- テスト: [Vitest](https://vitest.dev/) + [Testing Library](https://testing-library.com/) + jsdom
- コンポーネントカタログ: [Storybook](https://storybook.js.org/)（a11yアドオン導入済み）

## ローカルでの動かし方

```bash
pnpm install
pnpm dev
```

- `pnpm lint` — oxlintでlint
- `pnpm format` / `pnpm format:check` — oxfmtでフォーマット / チェック
- `pnpm typecheck` — 各ワークスペースの型チェック
- `pnpm build` — 各ワークスペースのビルド
- `pnpm test` — 各ワークスペースのテスト（Vitest）
- `pnpm --filter @repo/web storybook` — Storybookの起動
