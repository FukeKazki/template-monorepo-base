import { useMutation, useQueryClient } from "@tanstack/react-query";
import { TaggedError } from "better-result";
import { apiClient } from "@/lib/open-api/client";
import type { components } from "@/lib/open-api/schema.gen";

export class CreateProductError extends TaggedError("CreateProductError")<{
  cause?: unknown;
}> {}

type CreateProductInput = components["schemas"]["Product"];

const postProduct = async (input: CreateProductInput) => {
  const { data, error } = await apiClient.POST("/products", { body: input });
  if (error) {
    throw new CreateProductError({ cause: error });
  }
  return data;
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  const {
    mutateAsync: createProduct,
    isPending: isCreatingProduct,
    error,
  } = useMutation<CreateProductInput, CreateProductError, CreateProductInput>({
    mutationFn: postProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["productList"] });
    },
  });

  return { createProduct, isCreatingProduct, error };
};
