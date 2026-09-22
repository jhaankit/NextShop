import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { PackageSearch } from "lucide-react";
import { SubMenuBtn } from "@/components/layout/sub-menu-btn";

const meta = {
  title: "Design System/Navigation/SubMenuBtn",
  component: SubMenuBtn,
  decorators: [
    (Story) => (
      <div className="min-h-96 w-72 border-r border-slate-200 bg-white p-5">
        <Story />
      </div>
    )
  ],
  args: { label: "Products", icon: PackageSearch }
} satisfies Meta<typeof SubMenuBtn>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Active: Story = { args: { active: true } };
