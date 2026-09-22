import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { DataTable } from "@/components/ui/data-table";

describe("DataTable", () => {
  it("renders rows and supports sorting", async () => {
    render(<DataTable selectable rows={[{ id: "2", name: "Beta" }, { id: "1", name: "Alpha" }]} columns={[{ id: "name", header: "Name", accessor: (row) => row.name, sortValue: (row) => row.name }]} />);
    expect(screen.getAllByText("Beta").length).toBeGreaterThan(0);
    await userEvent.click(screen.getByRole("button", { name: /name/i }));
    expect(screen.getAllByRole("cell")[1]).toHaveTextContent("Alpha");
    await userEvent.click(screen.getByRole("checkbox", { name: "Select row 1" }));
    expect(screen.getByText("1 selected")).toBeInTheDocument();
  });
});
