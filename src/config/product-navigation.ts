export interface ProductNavigationLink {
  label: string;
  href: string;
  description?: string;
}

export interface ProductNavigationSection extends ProductNavigationLink {
  items: ProductNavigationLink[];
}

export interface ProductNavigationPromo extends ProductNavigationLink {
  tone: "contract" | "replenishment";
}

export interface ProductNavigation {
  allProducts: ProductNavigationLink;
  sections: ProductNavigationSection[];
  promos: ProductNavigationPromo[];
}

function productsHref(params: Record<string, string> = {}) {
  const search = new URLSearchParams(params);
  return search.size ? `/products?${search.toString()}` : "/products";
}

export const productNavigation: ProductNavigation = {
  allProducts: {
    label: "View all products",
    href: "/products",
    description: "Browse the full contract catalog for every active location."
  },
  sections: [
    {
      label: "Food Service",
      href: productsHref({ category: "Food Service" }),
      description: "Packaging and beverage supplies for daily service.",
      items: [
        { label: "Packaging", href: productsHref({ category: "Food Service", q: "Packaging" }) },
        { label: "Beverages", href: productsHref({ category: "Food Service", q: "Beverages" }) }
      ]
    },
    {
      label: "Facilities",
      href: productsHref({ category: "Facilities" }),
      description: "Cleaning and safety essentials for store teams.",
      items: [
        { label: "Cleaning", href: productsHref({ category: "Facilities", q: "Cleaning" }) },
        { label: "Safety", href: productsHref({ category: "Facilities", q: "Safety" }) }
      ]
    },
    {
      label: "Retail Operations",
      href: productsHref({ category: "Retail Operations" }),
      description: "Labels and point-of-sale operating supplies.",
      items: [
        { label: "Labels", href: productsHref({ category: "Retail Operations", q: "Labels" }) },
        { label: "Point of Sale", href: productsHref({ category: "Retail Operations", q: "Point of Sale" }) }
      ]
    },
    {
      label: "Office",
      href: productsHref({ category: "Office" }),
      description: "Paper and back-office replenishment items.",
      items: [{ label: "Paper", href: productsHref({ category: "Office", q: "Paper" }) }]
    },
    {
      label: "Cold Chain",
      href: productsHref({ category: "Cold Chain" }),
      description: "Storage supplies for temperature-sensitive operations.",
      items: [{ label: "Storage", href: productsHref({ category: "Cold Chain", q: "Storage" }) }]
    }
  ],
  promos: [
    {
      label: "Contract favorites",
      href: productsHref({ q: "contract" }),
      description: "Jump to items with negotiated pricing for your account.",
      tone: "contract"
    },
    {
      label: "Ready to reorder",
      href: productsHref({ availability: "IN_STOCK" }),
      description: "Find in-stock staples for upcoming replenishment cycles.",
      tone: "replenishment"
    }
  ]
};
