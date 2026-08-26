// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";
import { ProductListTable } from "./index";

function renderWithQueryClient() {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <ProductListTable />
    </QueryClientProvider>,
  );
}

describe("ProductListTable", () => {
  it("MSWでモックされた商品一覧を表示する", async () => {
    renderWithQueryClient();

    expect(await screen.findByText("Product 1")).toBeInTheDocument();
    expect(screen.getByText("Product 2")).toBeInTheDocument();
    expect(screen.getByText("Product 3")).toBeInTheDocument();
  });
});
