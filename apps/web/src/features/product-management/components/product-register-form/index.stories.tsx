import type { Meta, StoryObj } from "@storybook/react-vite";
import { http, HttpResponse } from "msw";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { ProductRegisterForm } from "./index";

const meta = {
  title: "features/ProductManagement/ProductRegisterForm",
  component: ProductRegisterForm,
} satisfies Meta<typeof ProductRegisterForm>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.type(canvas.getByLabelText("商品名"), "新商品");
    await userEvent.type(canvas.getByLabelText("価格"), "1000");
    await userEvent.type(canvas.getByLabelText("画像URL"), "https://picsum.photos/seed/new/100");
    await userEvent.click(canvas.getByRole("button", { name: "登録する" }));

    await waitFor(() => expect(canvas.getByLabelText("商品名")).toHaveValue(""));
  },
};

export const ValidationError: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole("button", { name: "登録する" }));

    await expect(canvas.findByText("商品名を入力してください")).resolves.toBeInTheDocument();
    await expect(canvas.findByText("画像URLを入力してください")).resolves.toBeInTheDocument();
  },
};

export const SubmitError: Story = {
  beforeEach({ msw }) {
    msw.use(
      http.post("/api/products", () =>
        HttpResponse.json({ message: "Internal Server Error" }, { status: 500 }),
      ),
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.type(canvas.getByLabelText("商品名"), "新商品");
    await userEvent.type(canvas.getByLabelText("価格"), "1000");
    await userEvent.type(canvas.getByLabelText("画像URL"), "https://picsum.photos/seed/new/100");
    await userEvent.click(canvas.getByRole("button", { name: "登録する" }));

    await expect(canvas.findByText("商品の登録に失敗しました。")).resolves.toBeInTheDocument();
  },
};
