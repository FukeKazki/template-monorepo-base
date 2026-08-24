// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { RouterProvider, createRouter, createMemoryHistory } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

function renderApp(initialPath = "/") {
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [initialPath] }),
  });
  return render(<RouterProvider router={router} />);
}

describe("Home", () => {
  it("見出しを表示する", async () => {
    renderApp();
    expect(await screen.findByRole("heading", { name: "Vite + React" })).toBeInTheDocument();
  });

  it("ボタンをクリックするとカウントが増える", async () => {
    const user = userEvent.setup();
    renderApp();

    const button = await screen.findByRole("button", { name: "count is 0" });
    await user.click(button);

    expect(screen.getByRole("button", { name: "count is 1" })).toBeInTheDocument();
  });
});
