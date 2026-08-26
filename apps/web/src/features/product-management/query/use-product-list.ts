import { useQuery } from "@tanstack/react-query";
import { TaggedError } from "better-result";
import { apiClient } from "@/lib/open-api/client";
import { constructProductList } from "../read-model/product-list";

export class FetchProductListError extends TaggedError("FetchProductListError")<{
  cause?: unknown;
}> {}

const fetchProductList = async () => {
  const { data, error } = await apiClient.GET("/products");
  if (error) {
    throw new FetchProductListError({ cause: error });
  }
  return data;
};

export const useProductList = () => {
  const {
    data,
    error,
    isPending,
    refetch: refetchProductList,
  } = useQuery<Awaited<ReturnType<typeof fetchProductList>>, FetchProductListError>({
    queryKey: ["productList"],
    queryFn: fetchProductList,
  });

  return {
    productList: data ? constructProductList(data) : [],
    error,
    isPending,
    refetchProductList,
  };
};
