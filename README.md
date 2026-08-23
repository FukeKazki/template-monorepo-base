# template-monorepo-base

pnpm workspaces によるモノレポの最小構成テンプレート。

## 構成

```
apps/
  web/    Vite + React + TypeScript
```

- パッケージマネージャ: pnpm
- Lint / Format: [oxlint](https://oxc.rs/) / [oxfmt](https://oxc.rs/)

## ローカルでの動かし方

```bash
pnpm install
pnpm dev
```

- `pnpm lint` — oxlintでlint
- `pnpm format` / `pnpm format:check` — oxfmtでフォーマット / チェック
- `pnpm typecheck` — 各ワークスペースの型チェック
- `pnpm build` — 各ワークスペースのビルド
