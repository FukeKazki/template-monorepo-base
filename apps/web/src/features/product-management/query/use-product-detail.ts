import { apiClient } from "@/lib/open-api/client";
import { useResultQuery } from "@/lib/tanstack-query/use-result-query";
import {
  FetchProductDetailError,
  type FetchProductDetail,
  ProductNotFoundError,
} from "../port/fetch-product-detail";
import { constructProductDetail, InvalidProductDetailError } from "../read-model/product-detail";
import type { ProductId } from "../read-model/product-id";

export const fetchProductDetail: FetchProductDetail = async (id) => {
  const { data, error, response } = await apiClient.GET("/products/{id}", {
    params: { path: { id } },
  });
  if (error) {
    if (response.status === 404) {
      return new ProductNotFoundError({ id });
    }
    return new FetchProductDetailError({ cause: error });
  }
  return data;
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
