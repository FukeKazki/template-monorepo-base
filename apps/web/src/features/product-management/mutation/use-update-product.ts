import { useMutation, useQueryClient } from "@tanstack/react-query";
import { TaggedError } from "better-result";
import { apiClient } from "@/lib/open-api/client";
import type { components } from "@/lib/open-api/schema.gen";

export class UpdateProductError extends TaggedError("UpdateProductError")<{
  cause?: unknown;
}> {}

type UpdateProductInput = components["schemas"]["UpdateProductRequest"] & { id: string };
type UpdateProductOutput = components["schemas"]["Product"];

const putProduct = async ({ id, ...body }: UpdateProductInput) => {
  const { data, error } = await apiClient.PUT("/products/{id}", {
    params: { path: { id } },
    body,
  });
  if (error) {
    throw new UpdateProductError({ cause: error });
  }
  return data;
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  const {
    mutateAsync: updateProduct,
    isPending: isUpdatingProduct,
    error,
  } = useMutation<UpdateProductOutput, UpdateProductError, UpdateProductInput>({
    mutationFn: putProduct,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["productList"] });
      queryClient.invalidateQueries({ queryKey: ["productDetail", data.id] });
    },
  });

  return { updateProduct, isUpdatingProduct, error };
};
