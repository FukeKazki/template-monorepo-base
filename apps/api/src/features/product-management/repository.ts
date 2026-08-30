import type { CreateProductRequest, Product, UpdateProductRequest } from "./schema";

// 永続化層を入れるまでの暫定実装。
// Workerのisolateごとに状態を持つため再起動やスケールアウトで初期値に戻る。
const store = new Map<string, Product>(
  (
    [
      {
        id: "1",
        name: "ワイヤレスマウス",
        price: 2980,
        imageUrl: "https://picsum.photos/seed/mouse/100",
      },
      {
        id: "2",
        name: "メカニカルキーボード",
        price: 12800,
        imageUrl: "https://picsum.photos/seed/keyboard/100",
      },
      { id: "3", name: "USB-Cハブ", price: 4500, imageUrl: "https://picsum.photos/seed/hub/100" },
    ] satisfies Product[]
  ).map((product) => [product.id, product]),
);

export const listProducts = (): Product[] => [...store.values()];

export const findProduct = (id: string): Product | undefined => store.get(id);

export const createProduct = (input: CreateProductRequest): Product => {
  const product: Product = { id: crypto.randomUUID(), ...input };
  store.set(product.id, product);
  return product;
};

export const updateProduct = (id: string, input: UpdateProductRequest): Product | undefined => {
  if (!store.has(id)) return undefined;
  const product: Product = { id, ...input };
  store.set(id, product);
  return product;
};

export const deleteProduct = (id: string): boolean => store.delete(id);
