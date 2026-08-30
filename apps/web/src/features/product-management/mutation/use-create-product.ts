import { useMutation, useQueryClient } from "@tanstack/react-query";
import { TaggedError } from "better-result";
import type { InferRequestType, InferResponseType } from "hono/client";
import { apiClient } from "@/lib/api/client";

export class CreateProductError extends TaggedError("CreateProductError")<{
  cause?: unknown;
}> {}

type CreateProductInput = InferRequestType<typeof apiClient.products.$post>["json"];
type CreateProductOutput = InferResponseType<typeof apiClient.products.$post, 201>;

const postProduct = async (input: CreateProductInput) => {
  const res = await apiClient.products.$post({ json: input });
  if (res.status !== 201) {
    throw new CreateProductError({ cause: await res.json() });
  }
  return await res.json();
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  const {
    mutateAsync: createProduct,
    isPending: isCreatingProduct,
    error,
  } = useMutation<CreateProductOutput, CreateProductError, CreateProductInput>({
    mutationFn: postProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["productList"] });
    },
  });

  return { createProduct, isCreatingProduct, error };
};
