import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/shared/status-badge";

const meta = { title: "Design System/DataTable", component: DataTable } satisfies Meta<typeof DataTable>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { args: { rows: [], columns: [] }, render: () => <DataTable rows={[{ id: "1", name: "SO-19001", status: "APPROVED" }, { id: "2", name: "SO-19002", status: "SUBMITTED" }]} columns={[{ id: "name", header: "Name", accessor: (row) => row.name }, { id: "status", header: "Status", accessor: (row) => <StatusBadge status={row.status} /> }]} /> };
export const Selectable: Story = { args: { rows: [], columns: [] }, render: () => <DataTable selectable rows={[{ id: "1", name: "INV-55001", status: "OPEN" }, { id: "2", name: "INV-55002", status: "PAID" }]} columns={[{ id: "name", header: "Name", accessor: (row) => row.name }, { id: "status", header: "Status", accessor: (row) => <StatusBadge status={row.status} /> }]} /> };
export const Empty: Story = { args: { rows: [], columns: [] }, render: () => <DataTable rows={[]} columns={[{ id: "name", header: "Name", accessor: (row: { name: string }) => row.name }]} /> };
