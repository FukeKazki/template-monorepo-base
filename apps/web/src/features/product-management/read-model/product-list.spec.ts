import { describe, expect, it, vi } from "vitest";
import { constructProductList } from "./product-list";

describe("product-list", () => {
  it("【正常系】初期化できる", () => {
    const data = [
      { name: "Product A", price: 1000, imageUrl: "https://example.com/product-a.jpg" },
      { name: "Product B", price: 2000, imageUrl: "https://example.com/product-b.jpg" },
    ];

    const result = constructProductList(data);

    expect(result).toEqual([
      {
        name: "Product A",
        price: 1000,
        imageUrl: "https://example.com/product-a.jpg",
        formattedPrice: "￥1,000",
      },
      {
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
      { name: "Product A", price: 1000, imageUrl: "https://example.com/product-a.jpg" },
      { name: "", price: 2000, imageUrl: "https://example.com/product-b.jpg" },
    ];

    const result = constructProductList(data);

    expect(result).toEqual([
      {
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
