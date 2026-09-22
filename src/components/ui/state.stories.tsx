import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/state";

const meta = { title: "Design System/States" } satisfies Meta;
export default meta;
type Story = StoryObj;
export const Loading: Story = { render: () => <LoadingState /> };
export const Empty: Story = { render: () => <EmptyState /> };
export const Error: Story = { render: () => <ErrorState /> };
