import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/open-api/client";
import { constructProductList } from "../read-model/product";

export const useProductList = () => {
  const data = useQuery({
    queryKey: ["productList"],
    queryFn: async () => {
      const { data, error } = await apiClient.GET("/products");
      if (error) {
        throw new Error("Failed to fetch product list");
      }
      return data;
    },
  });

  if (!data.data) {
    return [];
  }

  const productList = constructProductList(data.data);
  return productList;
};
