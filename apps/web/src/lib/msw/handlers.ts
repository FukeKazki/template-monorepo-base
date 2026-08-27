import { createOpenApiHttp } from "openapi-msw";
import type { paths } from "@/lib/open-api/schema.gen";

export const http = createOpenApiHttp<paths>({ baseUrl: "/api" });

export const defaultProducts = [
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

export const handlers = [
  http.get("/products", ({ response }) => response(200).json(defaultProducts)),
  http.post("/products", async ({ request, response }) => {
    const body = await request.json();
    return response(201).json({ id: crypto.randomUUID(), ...body });
  }),
  http.get("/products/{id}", ({ params, response }) => {
    const product = defaultProducts.find((product) => product.id === params.id);
    if (!product) {
      return response(404).json({ message: "商品が見つかりません" });
    }
    return response(200).json(product);
  }),
  http.put("/products/{id}", async ({ params, request, response }) => {
    const product = defaultProducts.find((product) => product.id === params.id);
    if (!product) {
      return response(404).json({ message: "商品が見つかりません" });
    }
    const body = await request.json();
    return response(200).json({ id: product.id, ...body });
  }),
  http.delete("/products/{id}", ({ params, response }) => {
    const product = defaultProducts.find((product) => product.id === params.id);
    if (!product) {
      return response(404).json({ message: "商品が見つかりません" });
    }
    return response(204).empty();
  }),
];
