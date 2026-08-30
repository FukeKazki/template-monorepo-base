---
version: alpha
name: Template Monorepo Base (apps/web)
description: "shadcn/ui（style: base-nova, baseColor: neutral）をベースにした、装飾を持たないニュートラルな業務管理UIのデザインシステム。"
colors:
  primary: "#171717"
  primary-foreground: "#fafafa"
  foreground: "#0a0a0a"
  muted-foreground: "#737373"
  muted: "#f5f5f5"
  border: "#e5e5e5"
  background: "#ffffff"
  card: "#ffffff"
  ring: "#a3a3a3"
  error: "#dc2626"
typography:
  h1:
    fontFamily: Geist Variable
    fontSize: 24px
    fontWeight: 700
    lineHeight: 32px
  h2:
    fontFamily: Geist Variable
    fontSize: 18px
    fontWeight: 600
    lineHeight: 28px
  body-md:
    fontFamily: Geist Variable
    fontSize: 14px
    fontWeight: 400
    lineHeight: 20px
  body-mobile:
    fontFamily: Geist Variable
    fontSize: 16px
    fontWeight: 400
    lineHeight: 24px
rounded:
  lg: 10px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  xxl: 48px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    typography: "{typography.body-md}"
    rounded: "{rounded.lg}"
    height: 32px
    padding: 0px 10px
  button-primary-hover:
    backgroundColor: "rgba(23,23,23,.8)"
  button-secondary:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    typography: "{typography.body-md}"
    rounded: "{rounded.lg}"
    height: 32px
  button-secondary-hover:
    backgroundColor: "{colors.muted}"
  button-destructive:
    backgroundColor: "oklch(0.577 0.245 27.325 / 0.1)"
    textColor: "{colors.error}"
    typography: "{typography.body-md}"
    rounded: "{rounded.lg}"
    height: 32px
  button-destructive-hover:
    backgroundColor: "oklch(0.577 0.245 27.325 / 0.2)"
  input:
    backgroundColor: "{colors.background}"
    rounded: "{rounded.lg}"
    height: 32px
    padding: 4px 10px
    typography: "{typography.body-mobile}"
  card:
    backgroundColor: "{colors.card}"
    rounded: "{rounded.lg}"
    padding: "{spacing.lg}"
  text-caption:
    textColor: "{colors.muted-foreground}"
    typography: "{typography.body-md}"
---

# DESIGN.md — Template Monorepo Base (apps/web)

> このファイルはAIエージェントが正確な日本語UIを生成するためのデザイン仕様書です。
> セクションヘッダーは英語、値の説明は日本語で記述しています。
>
> 値はすべて `apps/web/src/index.css`（shadcn/ui, style: `base-nova`, baseColor: `neutral`）および `apps/web/src/ui/*.tsx` の実装から抽出した実測値です。色の一次情報は CSS 変数の `oklch()` 値であり、hex は参照用の近似値（Tailwind v4 の `neutral` / `red` スケール相当）です。

---

## Overview

ニュートラルで装飾のない、shadcn/ui 標準に忠実な業務管理UI。テンプレートリポジトリとして再利用されることを前提に、ブランド色や独自装飾を持たない。情報密度は中程度の業務UI（データテーブル + フォーム中心）で、`h-8`（32px）のコンパクトなコントロール高さを基準とする。キーワードは「ニュートラル、ミニマル、機能的、一貫性、標準的」。

---

## Colors

このデザインシステムは単色ブランド（`primary`）+ ニュートラル階調 + 単一の意味的な赤（`error`）のみで構成される、彩度を持たないパレットである。

- **Primary (`#171717`):** CTAボタン（`Button` default）やリンク（`text-primary`）に使う唯一のアクセント。ホバー時は別トークンを持たず、`primary` を80%不透明度（`rgba(23,23,23,.8)`）にして表現する
- **Foreground (`#0a0a0a`):** 本文テキストの基本色
- **Muted Foreground (`#737373`):** 補足テキスト・エラー詳細・キャプションに使う低コントラストのグレー
- **Border (`#e5e5e5`):** 区切り線、入力欄・outlineボタンの枠線
- **Background / Card (`#ffffff`):** ページ背景とカード面は同値。塗り分けをせず、`border` との組み合わせでのみ面を表現する
- **Error (`#dc2626`):** エラー文言・削除ボタンに使う唯一の意味的な色。ボタン背景は本色の10%不透明塗り（`oklch(0.577 0.245 27.325 / 0.1)`）に本色文字を乗せる「ソフト」スタイルで、ソリッドな赤背景では使わない

**未定義の意味色**: `warning` / `success` トークンはこのデザインシステムに存在しない。追加する場合は既存の `error` と同じ「10%淡色塗り + 本色文字」の作法に揃えること。

**ダークモード**: `.dark` クラス配下で全トークンが反転定義される（例: `background` は `oklch(0.145 0 0)`、`foreground` は `oklch(0.985 0 0)` 相当に反転）。UI生成時は個別に色を決め打ちせず、必ず CSS 変数 (`var(--foreground)` 等) 経由で参照することでダークモードに自動追従させる。

---

## Typography

明示的な和文フォント指定はなく、`"Geist Variable", sans-serif` のみが指定されている（`@fontsource-variable/geist` で自己ホスト）。和文グリフの表示は OS 標準フォント（ヒラギノ角ゴ ProN / Yu Gothic 等）のフォールバックに委ねている。厳密な日本語組版が必要な画面を追加する場合は、Noto Sans JP 等の追加フォントや `overflow-wrap: break-word` / `line-break: strict` の個別設定を検討する。

- **h1 (24px / 700 / lh 32px):** ページタイトル（例: `商品一覧`, `商品を登録`）
- **h2 (18px / 600 / lh 28px):** `AlertDialogTitle`（確認ダイアログの見出し）
- **body-md (14px / 400 / lh 20px):** 本文、`Button`、`Label`、`Input`（`md:`以上）。同サイズ・同ウェイトのまま色のみ `muted-foreground` に変更したものをキャプション・エラー詳細として使う
- **body-mobile (16px / 400 / lh 24px):** `Input` のモバイル基準サイズ。iOS Safari のフォーカス時自動ズームを防ぐための Tailwind の慣習で、`md:`以上では `body-md` に切り替わる

行間・字間はすべて Tailwind v4 の各サイズユーティリティのデフォルト値に従い、独自の `line-height` / `letter-spacing` 調整は行っていない。`font-feature-settings` の指定もなし。縦書きは非対応。

---

## Layout

グローバルなレイアウトシェル（ヘッダー・サイドバー・コンテナ幅の統一規定）は現状未整備で、各ページが個別に `spacing.md`（`p-4`）等で余白を持つのみ。CSS Grid の共通トークンはなく、実装は Flexbox（`flex flex-col gap-*`）中心。

Tailwind v4 標準の4pxグリッドをそのまま使用（独自スケールなし）。`spacing` トークンはこのリポジトリで実際に使われている代表値。

**ブレークポイント**（Tailwind v4 標準値、`tailwind.config.js` は存在せずカスタム定義なし）:

| Name | Width |
|------|-------|
| Mobile | < 768px（`md`未満） |
| Tablet | 768px–1023px（`md`–`lg`未満） |
| Desktop | ≥ 1024px（`lg`以上） |

**タッチターゲットの既知の乖離**: 推奨最小サイズは44px×44px（WCAG基準）だが、現行の `Button` / `Input` の既定高さは32px（`h-8`）で未達。モバイル向け画面を追加する場合はタップ領域の拡張（`padding` 追加等）を個別に検討する。

---

## Elevation & Depth

深さはほぼ「フラット + border」で表現し、シャドウの使用は最小限に留める。

| Level | Shadow | 用途 |
|-------|--------|------|
| 0 | none | 通常要素。カード相当の面もborderのみで表現する |
| 2 | `shadow-lg`（`0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)`） | `AlertDialogContent`（確認ダイアログ）のみ |

Level 1 / 3 は未使用。新規コンポーネントで浮遊感を出す場合も、まずborderでの表現を優先し、モーダル・ポップオーバー等の「ページ上に浮く」要素にのみ `shadow-lg` を検討する。

---

## Shapes

角丸は `rounded.lg`（10px、`--radius-lg`）ひとつに統一されており、ボタン・インプット・カード相当の面すべてがこの値を使う。他の角丸スケール（`sm` / `md` / `xl` / `full`）はこのテンプレートに未導入で、独自に追加しない。

---

## Components

`apps/web/src/ui/*.tsx`（shadcn/ui, style: `base-nova`）の実装値。

### Buttons

**Primary**（`variant="default"`）: 背景 `colors.primary`、文字 `colors.primary-foreground`、`padding: 0px 10px`、`rounded.lg`、`body-md`、高さ32px。ホバーで `button-primary-hover`（80%不透明度）。

**Secondary**（`variant="outline"`）: 背景は透明（実質 `colors.background`）、文字 `colors.foreground`、枠線 `colors.border`。padding / radius / heightはPrimaryと同一。ホバーで `button-secondary-hover`（`colors.muted`）。

**Destructive**（`variant="destructive"`）: ソフト塗り。背景 `oklch(0.577 0.245 27.325 / 0.1)`、文字 `colors.error`。ホバーで不透明度20%に上がる。**ソリッドな赤背景では塗らない**点に注意。

### Inputs

背景は透明（実質 `colors.background`）、枠線 `colors.border`、フォーカス時は枠線 `colors.ring` + 3pxのリング状box-shadow（`ring` の50%不透明度）。`rounded.lg`、`padding: 4px 10px`、高さ32px。フォントサイズはモバイルで `body-mobile`（16px）、`md:`以上で `body-md`（14px）に縮小する。

### Cards

このテンプレートに `Card` コンポーネントは未導入。面表現が必要な場合は `border` + `rounded.lg` を用いる想定で、背景 `colors.card`、枠線 `colors.border`、padding 24px（`spacing.lg`）、シャドウなし（Elevation Level 0）とする。

### 未実装のコンポーネント種別

Chips、Lists、Tooltips、Checkboxes、Radio buttons はこのテンプレートに未導入。追加する際は既存のButtons/Inputsのトークン（色はCSS変数経由、高さ32px、角丸10px）に揃えること。

---

## Do's and Don'ts

### Do（推奨）

- 色は必ず CSS 変数（`var(--foreground)` 等 / Tailwind の `text-foreground` 等のトークンクラス）経由で参照し、直接 hex を書かない
- ボタン・インプットの高さは `h-8`（32px）に統一する
- 角丸は `rounded-lg`（`rounded.lg` = 10px）を基準にする
- アイコンは `lucide-react` に統一する（このアプリの UI に絵文字・他アイコンセットは使わない）
- ダークモードは `.dark` クラスでの変数上書きに従う（コンポーネント側で個別に色を決め打ちしない）

### Don't（禁止）

- Tailwind のデフォルトカラー（`gray-500` 等）を直接指定しない。必ず `border` / `muted-foreground` 等のセマンティックトークンを使う
- 独自の角丸・余白サイズを追加しない（既存の `rounded` / `spacing` スケールに合わせる）
- `Button` の `destructive` をソリッドな赤背景で塗らない（本デザインシステムは10%淡色塗り + 赤文字の「ソフト」スタイル）
- 実データに存在しない項目（例: 商品管理機能におけるカテゴリ・説明文）を UI に勝手に追加しない

---

## Agent Prompt Guide

### クイックリファレンス

```
Primary: #171717
Foreground: #0a0a0a
Muted Foreground: #737373
Border: #e5e5e5
Background: #ffffff
Error: #dc2626
Font: "Geist Variable", sans-serif
Body Size: 14px（モバイルのInputのみ16px）
Radius: 10px (rounded.lg)
Control Height: 32px (h-8)
```

### プロンプト例

```
このリポジトリのデザインシステム（apps/web/DESIGN.md）に従って、商品一覧テーブルを作成してください。
- ボタンは @/ui/button の Button コンポーネント（variant="default"）を使用し、独自にスタイルを組まない
- 色は var(--foreground) 等の CSS 変数、または text-foreground 等の Tailwind トークンクラスを使用し、hexを直書きしない
- コントロール高さは h-8（32px）、角丸は rounded-lg（10px）に統一する
- 実データに存在しない項目を追加しない
```
