import { describe, expect, it, vi } from "vitest";
import { constructProductList } from "./product-list";

describe("product-list", () => {
  it("【正常系】初期化できる", () => {
    const data = [
      { id: "1", name: "Product A", price: 1000, imageUrl: "https://example.com/product-a.jpg" },
      { id: "2", name: "Product B", price: 2000, imageUrl: "https://example.com/product-b.jpg" },
    ];

    const result = constructProductList(data);

    expect(result).toEqual([
      {
        id: "1",
        name: "Product A",
        price: 1000,
        imageUrl: "https://example.com/product-a.jpg",
        formattedPrice: "￥1,000",
      },
      {
        id: "2",
        name: "Product B",
        price: 2000,
        imageUrl: "https://example.com/product-b.jpg",
        formattedPrice: "￥2,000",
      },
    ]);
  });

  it("【異常系】不正なデータが含まれる場合はその要素だけ除外される", () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const data = [
      { id: "1", name: "Product A", price: 1000, imageUrl: "https://example.com/product-a.jpg" },
      { id: "2", name: "", price: 2000, imageUrl: "https://example.com/product-b.jpg" },
    ];

    const result = constructProductList(data);

    expect(result).toEqual([
      {
        id: "1",
        name: "Product A",
        price: 1000,
        imageUrl: "https://example.com/product-a.jpg",
        formattedPrice: "￥1,000",
      },
    ]);
    expect(consoleErrorSpy).toHaveBeenCalledOnce();
    consoleErrorSpy.mockRestore();
  });
});
