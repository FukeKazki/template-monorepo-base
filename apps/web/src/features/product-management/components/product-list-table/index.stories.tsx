import type { Meta, StoryObj } from "@storybook/react-vite";
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

export const Empty: Story = {
  beforeEach({ msw }) {
    msw.use(http.get("/products", ({ response }) => response(200).json([])));
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.findByText("データがありません")).resolves.toBeInTheDocument();
  },
};
