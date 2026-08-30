import { useQuery } from "@tanstack/react-query";
import { TaggedError } from "better-result";
import { apiClient } from "@/lib/api/client";
import { constructProductList } from "../read-model/product-list";

export class FetchProductListError extends TaggedError("FetchProductListError")<{
  cause?: unknown;
}> {}

const fetchProductList = async () => {
  const res = await apiClient.products.$get();
  if (res.status !== 200) {
    throw new FetchProductListError({ cause: await res.json() });
  }
  return await res.json();
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
