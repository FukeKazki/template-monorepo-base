# template-monorepo-base

pnpm workspaces によるモノレポの最小構成テンプレート。[Vite+](https://viteplus.dev/) の `vp create` から利用できる**静的テンプレート**（テンプレートエンジンによる変換なしで、そのままコピーされる形式）です。

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

## Vite+ のテンプレートとして登録する

このリポジトリ自体は単体の静的テンプレートです。組織の `@org/create` パッケージ（`package.json` の `createConfig.templates`）から次のように参照することで、`vp create @org` のピッカーやCIから利用できます。

```json
{
  "createConfig": {
    "templates": [
      {
        "name": "monorepo",
        "description": "pnpm workspaces monorepo (Vite + React)",
        "template": "github:kazki/template-monorepo-base",
        "monorepo": true
      }
    ]
  }
}
```

```bash
vp create @your-org:monorepo
```
