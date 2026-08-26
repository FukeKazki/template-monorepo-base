import { describe, expect, it } from "vitest";
import { constructProductList } from "./product-list";

describe("product-list", () => {
  it("【正常系】初期化できる", () => {
    const data = [
      { name: "Product A", price: 1000, imageUrl: "https://example.com/product-a.jpg" },
      { name: "Product B", price: 2000, imageUrl: "https://example.com/product-b.jpg" },
    ];

    expect(constructProductList(data)).toEqual([
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
});
