import { createFileRoute } from "@tanstack/react-router";
import { ProductListTable } from "@/features/product-management/components/product-list-table";
import { ProductRegisterForm } from "@/features/product-management/components/product-register-form";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <main className="flex flex-col gap-8 p-4">
      <section className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">商品登録</h1>
        <ProductRegisterForm />
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">商品一覧</h2>
        <ProductListTable />
      </section>
    </main>
  );
}
