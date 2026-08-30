import type { GenerateSpecOptions } from "hono-openapi";

/**
 * OpenAPIドキュメントのメタ情報。
 * 実行時の `/openapi.json` エンドポイント (src/index.ts) と
 * ファイル出力用スクリプト (scripts/generate-openapi.ts) の双方で共有する。
 */
export const openApiOptions: Partial<GenerateSpecOptions> = {
  documentation: {
    openapi: "3.1.0",
    info: {
      title: "Product Management API",
      version: "0.0.0",
      description: "商品管理APIの仕様。apps/api の実装から自動生成される。",
    },
  },
};
