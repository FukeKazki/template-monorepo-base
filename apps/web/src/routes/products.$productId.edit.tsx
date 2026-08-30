import { createFileRoute } from "@tanstack/react-router";
import { ProductEditForm } from "@/features/product-management/components/product-edit-form";

export const Route = createFileRoute("/products/$productId/edit")({
  component: ProductEditPage,
});

function ProductEditPage() {
  const { productId } = Route.useParams();

  return (
    <main className="p-4">
      <ProductEditForm productId={productId} />
    </main>
  );
}
