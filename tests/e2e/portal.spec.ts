import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

type ProductResponse = { id: string; price: number; contractPrice?: number; inventory: number; availability: string; minOrderQuantity: number };
type OrderResponse = { id: string; orderNumber: string; status: string };

async function login(page: import("@playwright/test").Page, email = "admin@example.com") {
  await page.goto("/login");
  await page.locator("#email").fill(email);
  await page.locator("#password").fill("password");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
}

async function createHighValueApprovalOrder(page: import("@playwright/test").Page, purchaseOrderNumber: string): Promise<OrderResponse> {
  const productResponse = await page.request.get("/api/products?locationId=loc_0002&sort=price-desc&pageSize=50");
  expect(productResponse.ok()).toBe(true);
  const products = (await productResponse.json()) as { items: ProductResponse[] };
  const product = products.items.find((item) => item.availability !== "OUT_OF_STOCK" && (item.contractPrice ?? item.price) * item.inventory > 10_100);
  expect(product).toBeDefined();
  if (!product) throw new Error("No product can create a high-value approval order.");
  const unitPrice = product.contractPrice ?? product.price;
  const quantity = Math.max(product.minOrderQuantity, Math.ceil(10_100 / unitPrice));
  const csrf = (await page.context().cookies()).find((cookie) => cookie.name === "retailer_csrf")?.value;
  expect(csrf).toBeDefined();
  const orderResponse = await page.request.post("/api/orders", {
    headers: { "X-CSRF-Token": csrf ?? "" },
    data: {
      purchaseOrderNumber,
      customerLocationId: "loc_0002",
      shippingAddressId: "addr_0002",
      billingAddressId: "addr_0003",
      items: [{ productId: product.id, quantity }]
    }
  });
  expect(orderResponse.ok()).toBe(true);
  const order = (await orderResponse.json()) as OrderResponse;
  expect(order.status).toBe("SUBMITTED");
  return order;
}

async function switchActiveLocation(page: import("@playwright/test").Page) {
  const viewport = page.viewportSize();
  if (viewport && viewport.width < 1024) {
    await page.getByRole("button", { name: "Open navigation" }).click();
    await page.locator("#mobile-active-location").selectOption({ index: 1 });
    await page.getByRole("button", { name: "Close navigation" }).click();
  } else {
    await page.locator("#active-location").selectOption({ index: 1 });
  }
}

test("login to dashboard and pass basic accessibility", async ({ page }) => {
  await login(page);
  await switchActiveLocation(page);
  await expect(page.getByRole("heading", { name: "Recent documents" })).toBeVisible();
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

test("request password reset from the login page", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "Forgot your password?" }).click();
  await page.getByLabel("Account email").fill("buyer@example.com");
  await page.getByRole("button", { name: "Request reset" }).click();
  await expect(page.getByText(/password reset instructions/i)).toBeVisible();
});

test("search product, add to cart, and place order", async ({ page }) => {
  await login(page);
  await page.goto("/products");
  await page.getByPlaceholder("Search product or SKU").fill("Packaging");
  await page.getByRole("link", { name: /Supply/ }).first().click();
  await page.getByRole("button", { name: "Add to cart" }).click();
  await page.goto("/cart");
  await page.goto("/checkout");
  await page.getByLabel("Purchase order number").fill("PO-E2E-100");
  await page.getByLabel("Customer location").selectOption({ index: 1 });
  await page.getByLabel("Shipping address").selectOption({ index: 1 });
  await page.getByLabel("Billing address").selectOption({ index: 1 });
  await page.getByRole("button", { name: "Place order" }).click();
  await expect(page.getByRole("heading", { name: /SO-/ })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Documents" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Shipments" })).toBeVisible();
});

test("desktop product submenu filters the catalog", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "The product submenu is desktop-only.");
  await login(page);
  await page.getByRole("button", { name: "Products menu" }).click();
  const submenu = page.getByRole("region", { name: "Products submenu" });
  await expect(submenu).toBeVisible();
  await submenu.getByRole("link", { name: "Packaging", exact: true }).click();
  await expect(page).toHaveURL(/\/products\?category=Food\+Service&q=Packaging/);
  await expect(page.getByPlaceholder("Search product or SKU")).toHaveValue("Packaging");
  await expect(page.getByLabel("Category filter")).toHaveValue("Food Service");
  await expect(page.getByRole("link", { name: /Packaging Supply/ }).first()).toBeVisible();
});

test("find and open fulfillment and financial documents", async ({ page }) => {
  await login(page);
  await page.goto("/documents");
  await page.getByLabel("Document type").selectOption("INVOICE");
  await page.getByRole("link", { name: /INV-/ }).first().click();
  await expect(page.getByRole("heading", { name: /INV-/ })).toBeVisible();
  await expect(page.getByRole("link", { name: "Open order" })).toBeVisible();
});

test("viewer is restricted from account management", async ({ page }) => {
  await page.goto("/login");
  await page.locator("#email").clear();
  await page.locator("#email").fill("viewer@example.com");
  await page.locator("#password").fill("password");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  await page.goto("/account");
  await expect(page.getByRole("heading", { name: "Access restricted" })).toBeVisible();
});

test("approver approves a pending order", async ({ page }, testInfo) => {
  await login(page);
  const order = await createHighValueApprovalOrder(page, `PO-E2E-APPROVE-${testInfo.project.name}`);
  await login(page, "approver@example.com");
  await page.goto(`/approvals?q=${order.orderNumber}`);
  await expect(page.getByRole("heading", { name: "Approvals", exact: true })).toBeVisible();
  await page.getByRole("link", { name: order.orderNumber }).click();
  await page.getByRole("button", { name: "Approve" }).click();
  await expect(page.getByRole("dialog", { name: "Approve order" })).toBeVisible();
  await page.getByRole("button", { name: "Approve order" }).click();
  await expect(page.getByText("Approved by Taylor Approver")).toBeVisible();
});

test("approver rejects a pending order with a reason", async ({ page }, testInfo) => {
  await login(page);
  const order = await createHighValueApprovalOrder(page, `PO-E2E-REJECT-${testInfo.project.name}`);
  await login(page, "approver@example.com");
  await page.goto(`/approvals?q=${order.orderNumber}`);
  await page.getByRole("button", { name: "Reject" }).first().click();
  await page.getByLabel("Rejection reason").fill("Budget owner declined this purchase order.");
  await page.getByRole("button", { name: "Reject order" }).click();
  await page.goto(`/orders/${order.id}`);
  await expect(page.getByText("Rejected by Taylor Approver")).toBeVisible();
  await expect(page.getByText("Budget owner declined this purchase order.", { exact: true })).toBeVisible();
});

test("buyer is restricted from approvals", async ({ page }) => {
  await login(page, "buyer@example.com");
  await page.goto("/approvals");
  await expect(page.getByRole("heading", { name: "Access restricted" })).toBeVisible();
});
