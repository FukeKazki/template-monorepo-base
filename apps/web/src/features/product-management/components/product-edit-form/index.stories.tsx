import type { Meta, StoryObj } from "@storybook/react-vite";
import { http as rawHttp, HttpResponse } from "msw";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { defaultProducts, http } from "@/lib/msw/handlers";
import { ProductEditForm } from "./index";

const meta = {
  title: "features/ProductManagement/ProductEditForm",
  component: ProductEditForm,
  args: {
    productId: defaultProducts[0]?.id ?? "1",
  },
} satisfies Meta<typeof ProductEditForm>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitFor(() =>
      expect(canvas.getByLabelText("商品名")).toHaveValue(defaultProducts[0]!.name),
    );

    await userEvent.clear(canvas.getByLabelText("商品名"));
    await userEvent.type(canvas.getByLabelText("商品名"), "更新後の商品名");
    await userEvent.click(canvas.getByRole("button", { name: "更新する" }));

    await waitFor(() =>
      expect(canvas.queryByText("商品の更新に失敗しました。")).not.toBeInTheDocument(),
    );
  },
};

export const ValidationError: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitFor(() =>
      expect(canvas.getByLabelText("商品名")).toHaveValue(defaultProducts[0]!.name),
    );

    await userEvent.clear(canvas.getByLabelText("商品名"));
    await userEvent.clear(canvas.getByLabelText("画像URL"));
    await userEvent.click(canvas.getByRole("button", { name: "更新する" }));

    await expect(canvas.findByText("商品名を入力してください")).resolves.toBeInTheDocument();
    await expect(canvas.findByText("画像URLを入力してください")).resolves.toBeInTheDocument();
  },
};

export const SubmitError: Story = {
  beforeEach({ msw }) {
    msw.use(
      rawHttp.put("/api/products/:id", () =>
        HttpResponse.json({ message: "Internal Server Error" }, { status: 500 }),
      ),
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitFor(() =>
      expect(canvas.getByLabelText("商品名")).toHaveValue(defaultProducts[0]!.name),
    );

    await userEvent.click(canvas.getByRole("button", { name: "更新する" }));

    await expect(canvas.findByText("商品の更新に失敗しました。")).resolves.toBeInTheDocument();
  },
};

export const NotFound: Story = {
  args: {
    productId: "not-found-id",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.findByText("商品が見つかりませんでした。")).resolves.toBeInTheDocument();
  },
};

export const InvalidData: Story = {
  beforeEach({ msw }) {
    msw.use(
      http.get("/products/{id}", ({ params, response }) => {
        const product = defaultProducts.find((product) => product.id === params.id);
        return response(200).json({ ...(product ?? defaultProducts[0]!), imageUrl: "invalid-url" });
      }),
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.findByText("商品データの形式が不正なため表示できません。"),
    ).resolves.toBeInTheDocument();
  },
};
