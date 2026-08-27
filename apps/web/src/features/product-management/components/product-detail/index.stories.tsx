import type { Meta, StoryObj } from "@storybook/react-vite";
import { delay, http as rawHttp, HttpResponse } from "msw";
import { expect, screen, userEvent, within } from "storybook/test";
import { defaultProducts, http } from "@/lib/msw/handlers";
import { ProductDetail } from "./index";

const meta = {
  title: "features/ProductManagement/ProductDetail",
  component: ProductDetail,
  args: {
    productId: defaultProducts[0]?.id ?? "1",
  },
} satisfies Meta<typeof ProductDetail>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.findByText(defaultProducts[0]!.name)).resolves.toBeInTheDocument();
  },
};

export const Loading: Story = {
  beforeEach({ msw }) {
    msw.use(
      http.get("/products/{id}", async ({ params, response }) => {
        await delay("infinite");
        const product = defaultProducts.find((product) => product.id === params.id);
        return response(200).json(product ?? defaultProducts[0]!);
      }),
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.findByText("読み込み中...")).resolves.toBeInTheDocument();
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

export const FetchError: Story = {
  beforeEach({ msw }) {
    msw.use(
      rawHttp.get("/api/products/:id", () =>
        HttpResponse.json({ message: "Internal Server Error" }, { status: 500 }),
      ),
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.findByText("商品詳細の取得に失敗しました。")).resolves.toBeInTheDocument();
  },
};

export const Delete: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.findByText(defaultProducts[0]!.name)).resolves.toBeInTheDocument();

    await userEvent.click(canvas.getByRole("button", { name: "削除する" }));

    const dialog = await screen.findByRole("alertdialog");
    await expect(within(dialog).findByText("商品を削除しますか？")).resolves.toBeInTheDocument();

    await userEvent.click(within(dialog).getByRole("button", { name: "削除する" }));

    await expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  },
};

export const DeleteError: Story = {
  beforeEach({ msw }) {
    msw.use(
      rawHttp.delete("/api/products/:id", () =>
        HttpResponse.json({ message: "Internal Server Error" }, { status: 500 }),
      ),
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.findByText(defaultProducts[0]!.name)).resolves.toBeInTheDocument();

    await userEvent.click(canvas.getByRole("button", { name: "削除する" }));

    const dialog = await screen.findByRole("alertdialog");
    await userEvent.click(within(dialog).getByRole("button", { name: "削除する" }));

    await expect(canvas.findByText("商品の削除に失敗しました。")).resolves.toBeInTheDocument();
  },
};
