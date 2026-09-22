import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Field, Fieldset } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";

const meta = { title: "Design System/FormField", component: Field } satisfies Meta<typeof Field>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { args: { label: "Purchase order number", htmlFor: "po", children: <Input id="po" placeholder="PO-12345" /> } };
export const WithError: Story = { args: { label: "Email", htmlFor: "email", error: "Enter a valid email address", children: <Input id="email" aria-invalid /> } };
export const Grouped: Story = { args: { label: "Delivery contact", children: <Input id="contact" /> }, render: () => <Fieldset legend="Shipping preferences" description="These fields are read by assistive technology as one group."><Field label="Delivery contact" htmlFor="contact"><Input id="contact" /></Field></Fieldset> };
