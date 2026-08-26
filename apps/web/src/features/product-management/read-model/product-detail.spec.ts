import { describe, expect, it } from "vitest";
import { constructProductDetail, InvalidProductDetailError } from "./product-detail";

describe("product-detail", () => {
  it("【正常系】初期化できる", () => {
    const data = {
      id: "1",
      name: "Product A",
      price: 1000,
      imageUrl: "https://example.com/product-a.jpg",
    };

    const result = constructProductDetail(data);

    expect(result).toEqual({
      id: "1",
      name: "Product A",
      price: 1000,
      imageUrl: "https://example.com/product-a.jpg",
      formattedPrice: "￥1,000",
    });
  });

  it("【異常系】不正なデータの場合はInvalidProductDetailErrorを返す", () => {
    const data = {
      id: "1",
      name: "",
      price: 1000,
      imageUrl: "https://example.com/product-a.jpg",
    };

    const result = constructProductDetail(data);

    expect(result).toBeInstanceOf(InvalidProductDetailError);
  });
});
