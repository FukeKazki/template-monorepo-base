import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/ui/button";
import { ProductListTable } from "@/features/product-management/components/product-list-table";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const [count, setCount] = useState(0);

  return (
    <main>
      <h1 className="text-3xl font-bold text-blue-600">Vite + React</h1>
      <Button
        className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        onClick={() => setCount((c) => c + 1)}
      >
        count is {count}
      </Button>

      <ProductListTable />
    </main>
  );
}
