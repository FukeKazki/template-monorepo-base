import { createFileRoute } from "@tanstack/react-router";
import { ProductDetail } from "@/features/product-management/components/product-detail";

export const Route = createFileRoute("/products/$productId/")({
  component: ProductDetailPage,
});

function ProductDetailPage() {
  const { productId } = Route.useParams();

  return (
    <main className="p-4">
      <ProductDetail productId={productId} />
    </main>
  );
}
