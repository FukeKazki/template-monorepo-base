import { Result } from "better-result";
import { describe, expect, it } from "vitest";
import { constructProductList, InvalidProductListError } from "./product-list";

describe("product-list", () => {
  it("【正常系】初期化できる", () => {
    const data = [
      { name: "Product A", price: 1000, imageUrl: "https://example.com/product-a.jpg" },
      { name: "Product B", price: 2000, imageUrl: "https://example.com/product-b.jpg" },
    ];

    const result = constructProductList(data);

    expect(Result.isOk(result)).toBe(true);
    expect(result.unwrap()).toEqual([
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

  it("【異常系】不正なデータの場合はErrになる", () => {
    const data = [{ name: "", price: 1000, imageUrl: "https://example.com/product-a.jpg" }];

    const result = constructProductList(data);

    expect(Result.isError(result)).toBe(true);
    if (Result.isError(result)) {
      expect(result.error).toBeInstanceOf(InvalidProductListError);
    }
  });
});
