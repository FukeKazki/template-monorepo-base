import type { Meta, StoryObj } from "@storybook/react-vite";
import { delay, http as rawHttp, HttpResponse } from "msw";
import { expect, within } from "storybook/test";
import { defaultProducts, http } from "@/lib/msw/handlers";
import { ProductListTable } from "./index";

const meta = {
  title: "features/ProductManagement/ProductListTable",
  component: ProductListTable,
} satisfies Meta<typeof ProductListTable>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    for (const product of defaultProducts) {
      await expect(canvas.findByText(product.name)).resolves.toBeInTheDocument();
    }
  },
};

export const Loading: Story = {
  beforeEach({ msw }) {
    msw.use(
      http.get("/products", async ({ response }) => {
        await delay("infinite");
        return response(200).json(defaultProducts);
      }),
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.findByText("読み込み中...")).resolves.toBeInTheDocument();
  },
};

export const Empty: Story = {
  beforeEach({ msw }) {
    msw.use(http.get("/products", ({ response }) => response(200).json([])));
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.findByText("データがありません")).resolves.toBeInTheDocument();
  },
};

export const FetchError: Story = {
  beforeEach({ msw }) {
    msw.use(
      rawHttp.get("/api/products", () =>
        HttpResponse.json({ message: "Internal Server Error" }, { status: 500 }),
      ),
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.findByText("商品一覧の取得に失敗しました。")).resolves.toBeInTheDocument();
  },
};
