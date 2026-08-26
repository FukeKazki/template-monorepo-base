import { createOpenApiHttp } from "openapi-msw";
import type { paths } from "@/lib/open-api/schema.gen";

export const http = createOpenApiHttp<paths>({ baseUrl: "/api" });

export const defaultProducts = [
  { name: "ワイヤレスマウス", price: 2980, imageUrl: "https://picsum.photos/seed/mouse/100" },
  {
    name: "メカニカルキーボード",
    price: 12800,
    imageUrl: "https://picsum.photos/seed/keyboard/100",
  },
  { name: "USB-Cハブ", price: 4500, imageUrl: "https://picsum.photos/seed/hub/100" },
];

export const handlers = [
  http.get("/products", ({ response }) => response(200).json(defaultProducts)),
  http.post("/products", async ({ request, response }) => {
    const body = await request.json();
    return response(201).json(body);
  }),
];
