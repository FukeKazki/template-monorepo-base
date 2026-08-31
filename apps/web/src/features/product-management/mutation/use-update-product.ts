import { useMutation, useQueryClient } from "@tanstack/react-query";
import { TaggedError } from "better-result";
import type { InferRequestType, InferResponseType } from "hono/client";
import { apiClient } from "@/lib/hono/client";

export class UpdateProductError extends TaggedError("UpdateProductError")<{
  cause?: unknown;
}> {}

type UpdateProductRequest = InferRequestType<(typeof apiClient.products)[":id"]["$put"]>;
type UpdateProductInput = UpdateProductRequest["json"] & { id: string };
type UpdateProductOutput = InferResponseType<(typeof apiClient.products)[":id"]["$put"], 200>;

const putProduct = async ({ id, ...body }: UpdateProductInput) => {
  const res = await apiClient.products[":id"].$put({ param: { id }, json: body });
  if (res.status !== 200) {
    throw new UpdateProductError({ cause: await res.json() });
  }
  return await res.json();
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
