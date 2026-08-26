import { createOpenApiHttp } from "openapi-msw";
import type { paths } from "@/lib/open-api/schema.gen";

const http = createOpenApiHttp<paths>({ baseUrl: "/api" });

export const handlers = [
  http.get("/products", ({ response }) => {
    return response(200).json([
      { name: "Product 1", price: 10.99, imageUrl: "https://via.placeholder.com/150" },
      { name: "Product 2", price: 19.99, imageUrl: "https://via.placeholder.com/150" },
      { name: "Product 3", price: 5.99, imageUrl: "https://via.placeholder.com/150" },
    ]);
  }),
];
