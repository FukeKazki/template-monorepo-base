import { apiClient } from "@/lib/hono/client";
import { useResultQuery } from "@/lib/tanstack-query/use-result-query";
import {
  FetchProductDetailError,
  type FetchProductDetail,
  ProductNotFoundError,
} from "../port/fetch-product-detail";
import { constructProductDetail, InvalidProductDetailError } from "../read-model/product-detail";
import type { ProductId } from "../read-model/product-id";

export const fetchProductDetail: FetchProductDetail = async (id) => {
  const res = await apiClient.products[":id"].$get({ param: { id } });
  if (res.status === 404) {
    return new ProductNotFoundError({ id });
  }
  if (res.status !== 200) {
    return new FetchProductDetailError({ cause: await res.json() });
  }
  return await res.json();
};

export const useProductDetail = (id: ProductId) => {
  const {
    data,
    error: queryError,
    isPending,
    refetch: refetchProductDetail,
  } = useResultQuery({
    queryKey: ["productDetail", id],
    queryFn: () => fetchProductDetail(id),
    retry: false,
  });

  if (queryError) {
    return {
      productDetail: undefined,
      error: queryError,
      isPending,
      refetchProductDetail,
    };
  }
  if (!data) {
    return {
      productDetail: undefined,
      error: undefined,
      isPending,
      refetchProductDetail,
    };
  }

  const productDetail = constructProductDetail(data);
  if (productDetail instanceof InvalidProductDetailError) {
    return {
      productDetail: undefined,
      error: productDetail,
      isPending,
      refetchProductDetail,
    };
  }

  return {
    productDetail,
    error: undefined,
    isPending,
    refetchProductDetail,
  };
};
