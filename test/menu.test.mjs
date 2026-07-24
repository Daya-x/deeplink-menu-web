import test from "node:test";
import assert from "node:assert/strict";
import {
  calculateCartTotal,
  filterItemsByCategory,
  formatPrice,
  getCategories,
  isSubscriptionActive,
  normalizeCategory,
  parseMenuPrice,
  safeExternalUrl,
  safeImageUrl,
  sortMenuItems,
} from "../lib/menu.mjs";

test("normalizes empty categories to Other", () => {
  assert.equal(normalizeCategory(undefined), "Other");
  assert.equal(normalizeCategory("  "), "Other");
  assert.equal(normalizeCategory(" Drinks "), "Drinks");
});

test("builds and filters categories consistently", () => {
  const items = [
    { id: "1", category: "Mains" },
    { id: "2" },
    { id: "3", category: " Mains " },
  ];

  assert.deepEqual(getCategories(items), ["All", "Mains", "Other"]);
  assert.deepEqual(
    filterItemsByCategory(items, "Other").map((item) => item.id),
    ["2"]
  );
});

test("accepts finite non-negative prices only", () => {
  assert.equal(parseMenuPrice("1250.50"), 1250.5);
  assert.equal(parseMenuPrice(0), 0);
  assert.equal(parseMenuPrice(""), null);
  assert.equal(parseMenuPrice("free"), null);
  assert.equal(parseMenuPrice(-10), null);
});

test("calculates totals without allowing invalid values to poison the sum", () => {
  assert.equal(
    calculateCartTotal([{ price: "100" }, { price: 250 }, { price: "bad" }]),
    350
  );
  assert.equal(formatPrice(1250.5), "Rs 1,250.5");
});

test("checks subscription status and expiry", () => {
  const now = new Date("2026-07-24T10:00:00Z");

  assert.equal(
    isSubscriptionActive(
      { status: "active", expiresAt: "2026-07-24T10:01:00Z" },
      now
    ),
    true
  );
  assert.equal(
    isSubscriptionActive(
      { status: "active", expiresAt: "2026-07-24T09:59:00Z" },
      now
    ),
    false
  );
  assert.equal(
    isSubscriptionActive(
      { status: "inactive", expiresAt: "2027-07-24T10:00:00Z" },
      now
    ),
    false
  );
});

test("sorts menu items by creation time, then name", () => {
  const items = [
    { id: "2", name: "Tea", createdAt: { seconds: 20 } },
    { id: "1", name: "Cake", createdAt: { seconds: 10 } },
    { id: "3", name: "Coffee", createdAt: { seconds: 20 } },
  ];

  assert.deepEqual(
    sortMenuItems(items).map((item) => item.id),
    ["1", "3", "2"]
  );
});

test("allows only HTTP and HTTPS external URLs", () => {
  assert.equal(safeExternalUrl("javascript:alert(1)"), null);
  assert.equal(safeExternalUrl("not a url"), null);
  assert.equal(
    safeExternalUrl("https://example.com/menu"),
    "https://example.com/menu"
  );
});

test("allows only the configured Cloudinary image path", () => {
  assert.equal(
    safeImageUrl(
      "https://res.cloudinary.com/dbe63rr9s/image/upload/v1/menu/item.jpg"
    ),
    "https://res.cloudinary.com/dbe63rr9s/image/upload/v1/menu/item.jpg"
  );
  assert.equal(safeImageUrl("https://example.com/item.jpg"), null);
  assert.equal(
    safeImageUrl(
      "https://res.cloudinary.com/another-cloud/image/upload/item.jpg"
    ),
    null
  );
});
