import { useMutation, useQueryClient } from "@tanstack/react-query";
import { TaggedError } from "better-result";
import { apiClient } from "@/lib/hono/client";

export class DeleteProductError extends TaggedError("DeleteProductError")<{
  cause?: unknown;
}> {}

type DeleteProductInput = { id: string };

const deleteProduct = async ({ id }: DeleteProductInput) => {
  const res = await apiClient.products[":id"].$delete({ param: { id } });
  if (res.status !== 204) {
    throw new DeleteProductError({ cause: await res.json() });
  }
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  const {
    mutateAsync: deleteProduct_,
    isPending: isDeletingProduct,
    error,
  } = useMutation<void, DeleteProductError, DeleteProductInput>({
    mutationFn: deleteProduct,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["productList"] });
      queryClient.removeQueries({ queryKey: ["productDetail", variables.id] });
    },
  });

  return { deleteProduct: deleteProduct_, isDeletingProduct, error };
};
