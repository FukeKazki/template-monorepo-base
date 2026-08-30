import type { Product, ProductId } from "../domain/product";

// 永続化層を入れるまでの暫定実装。
// Workerのisolateごとに状態を持つため再起動やスケールアウトで初期値に戻る。
export const store = new Map<ProductId, Product>(
  (
    [
      {
        id: "1" as ProductId,
        name: "ワイヤレスマウス",
        price: 2980,
        imageUrl: "https://picsum.photos/seed/mouse/100",
      },
      {
        id: "2" as ProductId,
        name: "メカニカルキーボード",
        price: 12800,
        imageUrl: "https://picsum.photos/seed/keyboard/100",
      },
      {
        id: "3" as ProductId,
        name: "USB-Cハブ",
        price: 4500,
        imageUrl: "https://picsum.photos/seed/hub/100",
      },
    ] satisfies Product[]
  ).map((product) => [product.id, product]),
);
