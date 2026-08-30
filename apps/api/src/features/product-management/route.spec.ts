import { describe, expect, it } from "vitest";
import { productRoute } from "./route";

describe("productRoute", () => {
  it("【正常系】商品一覧を取得できる", async () => {
    const res = await productRoute.request("/products");

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual(
      expect.arrayContaining([expect.objectContaining({ id: "1" })]),
    );
  });

  it("【正常系】商品を登録して取得できる", async () => {
    const res = await productRoute.request("/products", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: "Product A",
        price: 1000,
        imageUrl: "https://example.com/product-a.jpg",
      }),
    });

    expect(res.status).toBe(201);
    const created = (await res.json()) as { id: string };

    const detail = await productRoute.request(`/products/${created.id}`);
    expect(detail.status).toBe(200);
    await expect(detail.json()).resolves.toMatchObject({ id: created.id, name: "Product A" });
  });

  it("【異常系】存在しない商品は404を返す", async () => {
    const res = await productRoute.request("/products/not-exist");

    expect(res.status).toBe(404);
    await expect(res.json()).resolves.toEqual({ message: "商品が見つかりません" });
  });

  it("【異常系】不正なリクエストボディは400を返す", async () => {
    const res = await productRoute.request("/products", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: "", price: "1000", imageUrl: "not-a-url" }),
    });

    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toEqual({ message: "リクエストが不正です" });
  });
});
