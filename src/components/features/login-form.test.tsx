import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { http, HttpResponse } from "msw";
import { LoginForm } from "@/components/features/login-form";
import { server } from "@/mocks/node";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push, refresh: vi.fn() }), useSearchParams: () => new URLSearchParams() }));

describe("LoginForm", () => {
  beforeEach(() => push.mockClear());
  it("submits valid mock credentials", async () => {
    render(<LoginForm />);
    await userEvent.click(screen.getByRole("button", { name: /sign in/i }));
    await waitFor(() => expect(push).toHaveBeenCalledWith("/dashboard"));
  });

  it("requests a mock password reset", async () => {
    server.use(http.post("/api/auth/password-reset", () => HttpResponse.json({ status: "SENT", message: "Reset requested." })));
    render(<LoginForm />);
    await userEvent.click(screen.getByRole("button", { name: /forgot your password/i }));
    await userEvent.type(screen.getByLabelText(/account email/i), "buyer@example.com");
    await userEvent.click(screen.getByRole("button", { name: /request reset/i }));
    expect(await screen.findByText("Reset requested.")).toBeInTheDocument();
  });
});
