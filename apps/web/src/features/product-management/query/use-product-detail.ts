import { useQuery } from "@tanstack/react-query";
import { TaggedError } from "better-result";
import { apiClient } from "@/lib/open-api/client";
import { constructProductDetail, InvalidProductDetailError } from "../read-model/product-detail";

export class FetchProductDetailError extends TaggedError("FetchProductDetailError")<{
  cause?: unknown;
}> {}

export class ProductNotFoundError extends TaggedError("ProductNotFoundError")<{
  id: string;
}> {}

const fetchProductDetail = async (id: string) => {
  const { data, error, response } = await apiClient.GET("/products/{id}", {
    params: { path: { id } },
  });
  if (error) {
    if (response.status === 404) {
      throw new ProductNotFoundError({ id });
    }
    throw new FetchProductDetailError({ cause: error });
  }
  return data;
};

export const useProductDetail = (id: string) => {
  const {
    data,
    error,
    isPending,
    refetch: refetchProductDetail,
  } = useQuery<
    Awaited<ReturnType<typeof fetchProductDetail>>,
    FetchProductDetailError | ProductNotFoundError
  >({
    queryKey: ["productDetail", id],
    queryFn: () => fetchProductDetail(id),
    retry: false,
  });

  const productDetail = data ? constructProductDetail(data) : undefined;
  if (productDetail instanceof InvalidProductDetailError) {
    console.error(productDetail);
  }

  return {
    productDetail: productDetail instanceof InvalidProductDetailError ? undefined : productDetail,
    error,
    isPending,
    refetchProductDetail,
  };
};
