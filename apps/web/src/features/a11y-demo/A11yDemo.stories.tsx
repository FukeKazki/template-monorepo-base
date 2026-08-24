import type { Meta, StoryObj } from "@storybook/react-vite";
import { A11yDemo } from "./A11yDemo";

const meta = {
  title: "examples/A11yDemo",
  component: A11yDemo,
} satisfies Meta<typeof A11yDemo>;

export default meta;

type Story = StoryObj<typeof meta>;

/** ラベル・alt・コントラストいずれも問題なし。Accessibility パネルは全項目 Pass になる。 */
export const Accessible: Story = {
  args: {
    accessible: true,
  },
};

/** input のラベル欠如、img の alt 欠如、ボタンのコントラスト不足を含む。Accessibility パネルに Violations が表示される。 */
export const WithViolations: Story = {
  args: {
    accessible: false,
  },
};
