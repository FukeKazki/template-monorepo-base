import { createFileRoute, Outlet } from "@tanstack/react-router";
import * as v from "valibot";
import { ProductIdSchema } from "@/features/product-management/read-model/product-id";

export const Route = createFileRoute("/products/$productId")({
  params: {
    parse: (raw) => ({ productId: v.parse(ProductIdSchema, raw.productId) }),
    stringify: (params) => ({ productId: params.productId }),
  },
  component: Outlet,
});
