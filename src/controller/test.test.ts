// order.ts

export interface Item {
  name: string;
  price: number;
  quantity: number;
  category?: string;
}

export interface User {
  tier: "free" | "pro" | "vip";
  createdAt: string; // "YYYY-MM-DD"
}

/**
 * Calculates the total order price including discounts and loyalty bonus.
 *
 * Requirements:
 * 1. Apply a 10% discount for "electronics" items if quantity >= 3.
 * 2. Apply a tier-based discount:
 *    - vip: 15%
 *    - pro: 10%
 *    - free: 0%
 * 3. Apply a loyalty bonus based on account age:
 *    - 1% off per year, max 5 years
 * 4. Round total to 2 decimal places.
 */
export function calculateOrderTotal(
  items: Item[],
  user: User,
  now: Date = new Date()
): number {
  let total = 0;

  for (const item of items) {
    let itemTotal = item.price * item.quantity;

    if (item.category === "electronics" && item.quantity >= 3) {
      itemTotal *= 0.9; // 10% discount
    }

    total += itemTotal;
  }

  // Tier discount
  const tierDiscounts: Record<string, number> = {
    free: 0,
    pro: 0.1,
    vip: 0.15,
  };
  const tierDiscount = tierDiscounts[user.tier] ?? 0;
  total *= 1 - tierDiscount;

  // Loyalty bonus
  try {
    const created = new Date(user.createdAt);
    let years = Math.floor(
      (now.getTime() - created.getTime()) / (365 * 24 * 60 * 60 * 1000)
    );
    if (years > 5) {
      years = 5;
    }
    if (years < 0) {
      years = 0;
    }

    total *= 1 - years * 0.01;
  } catch {
    // ignore invalid date
  }

  return Math.round(total * 100) / 100;
}

describe("calculateOrderTotal", () => {
  test("calculation of basic totals", () => {
    const mockItems: Item[] = [
      { name: "some name", price: 20, category: "electr", quantity: 2 },
    ];
    const mockUser: User = { createdAt: "2026-01-13", tier: "free" };
    expect(calculateOrderTotal(mockItems, mockUser)).toBe(40);
  });
  test("application of electronics dicount", () => {
    const mockItems: Item[] = [
      { name: "some name", price: 80, category: "electronics", quantity: 3 },
    ];
    const mockUser: User = { createdAt: "2026-01-13", tier: "free" };
    expect(calculateOrderTotal(mockItems, mockUser)).toBe(80 * 3 * 0.9);
  });
  test("apply of tier-based discounts", () => {
    const mockItems: Item[] = [
      { name: "some name", price: 80, category: "electronics", quantity: 2 },
    ];
    const mockUser: User = { createdAt: "2026-01-13", tier: "pro" };
    expect(calculateOrderTotal(mockItems, mockUser)).toBe(80 * 2 * 0.9);
  });
  test("apply loyalty bonus", () => {});
  test("rounding to 2 decimal places", () => {});
  test("Empty items array → total = 0", () => {});
  test("Invalid dates → ignore loyalty bonus", () => {});
  test("Quantity = 0 → item doesn’t add to total", () => {});
});
