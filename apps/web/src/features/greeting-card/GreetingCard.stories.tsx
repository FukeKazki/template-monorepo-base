import type { Meta, StoryObj } from "@storybook/react-vite";
import { GreetingCard } from "./GreetingCard";

const meta = {
  title: "features/GreetingCard",
  component: GreetingCard,
} satisfies Meta<typeof GreetingCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    name: "太郎",
  },
};

export const WithCustomMessage: Story = {
  args: {
    name: "花子",
    message: "今日もいい天気ですね。",
  },
};
