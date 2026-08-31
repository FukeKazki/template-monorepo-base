import type { InferResponseType } from "hono/client";
import { http, HttpResponse } from "msw";
import type { apiClient } from "@/lib/hono/client";

// レスポンスの形は Hono RPC の型から引く（api側のスキーマを変えるとここが型エラーになる）
type Product = InferResponseType<(typeof apiClient.products)[":id"]["$get"], 200>;

const NOT_FOUND_MESSAGE = "商品が見つかりません";

export const defaultProducts: Product[] = [
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
];

const findProduct = (id: string | readonly string[] | undefined) =>
  defaultProducts.find((product) => product.id === id);

export const handlers = [
  http.get("/api/products", () => HttpResponse.json(defaultProducts satisfies Product[])),
  http.post("/api/products", async ({ request }) => {
    const body = (await request.json()) as Omit<Product, "id">;
    return HttpResponse.json({ id: crypto.randomUUID(), ...body } satisfies Product, {
      status: 201,
    });
  }),
  http.get("/api/products/:id", ({ params }) => {
    const product = findProduct(params["id"]);
    if (!product) {
      return HttpResponse.json({ message: NOT_FOUND_MESSAGE }, { status: 404 });
    }
    return HttpResponse.json(product satisfies Product);
  }),
  http.put("/api/products/:id", async ({ params, request }) => {
    const product = findProduct(params["id"]);
    if (!product) {
      return HttpResponse.json({ message: NOT_FOUND_MESSAGE }, { status: 404 });
    }
    const body = (await request.json()) as Omit<Product, "id">;
    return HttpResponse.json({ id: product.id, ...body } satisfies Product);
  }),
  http.delete("/api/products/:id", ({ params }) => {
    const product = findProduct(params["id"]);
    if (!product) {
      return HttpResponse.json({ message: NOT_FOUND_MESSAGE }, { status: 404 });
    }
    return new HttpResponse(null, { status: 204 });
  }),
];
