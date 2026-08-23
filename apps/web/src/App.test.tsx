// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { App } from "./App";

describe("App", () => {
  it("見出しを表示する", () => {
    render(<App />);
    expect(screen.getByRole("heading", { name: "Vite + React" })).toBeInTheDocument();
  });

  it("ボタンをクリックするとカウントが増える", async () => {
    const user = userEvent.setup();
    render(<App />);

    const button = screen.getByRole("button", { name: "count is 0" });
    await user.click(button);

    expect(screen.getByRole("button", { name: "count is 1" })).toBeInTheDocument();
  });
});
