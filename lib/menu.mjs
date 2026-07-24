export const FALLBACK_CATEGORY = "Other";

export function normalizeCategory(category) {
  if (typeof category !== "string") return FALLBACK_CATEGORY;

  const normalized = category.trim();
  return normalized || FALLBACK_CATEGORY;
}

export function getCategories(items) {
  return [
    "All",
    ...new Set(items.map((item) => normalizeCategory(item.category))),
  ];
}

export function filterItemsByCategory(items, category) {
  if (category === "All") return items;

  return items.filter(
    (item) => normalizeCategory(item.category) === category
  );
}

export function parseMenuPrice(value) {
  if (value === null || value === undefined || value === "") return null;

  const price = Number(value);
  return Number.isFinite(price) && price >= 0 ? price : null;
}

export function calculateCartTotal(cart) {
  return cart.reduce((sum, item) => {
    const price = parseMenuPrice(item.price);
    return price === null ? sum : sum + price;
  }, 0);
}

export function toDate(value) {
  if (!value) return null;

  if (typeof value.toDate === "function") {
    const date = value.toDate();
    return Number.isNaN(date.getTime()) ? null : date;
  }

  if (typeof value.seconds === "number") {
    const date = new Date(value.seconds * 1000);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function getSubscriptionExpiry(subscription) {
  if (!subscription || subscription.status !== "active") return null;
  return toDate(subscription.expiresAt);
}

export function isSubscriptionActive(subscription, now = new Date()) {
  const expiry = getSubscriptionExpiry(subscription);
  return expiry !== null && expiry.getTime() > now.getTime();
}

function getTimestamp(value) {
  const date = toDate(value);
  return date ? date.getTime() : 0;
}

export function sortMenuItems(items) {
  return [...items].sort((a, b) => {
    const createdDifference =
      getTimestamp(a.createdAt) - getTimestamp(b.createdAt);

    if (createdDifference !== 0) return createdDifference;
    return String(a.name || "").localeCompare(String(b.name || ""));
  });
}

export function safeExternalUrl(value) {
  if (typeof value !== "string" || !value.trim()) return null;

  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:"
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}

export function safeImageUrl(value) {
  const safeUrl = safeExternalUrl(value);
  if (!safeUrl) return null;

  const url = new URL(safeUrl);
  return url.protocol === "https:" &&
    url.hostname === "res.cloudinary.com" &&
    url.pathname.startsWith("/dbe63rr9s/")
    ? url.toString()
    : null;
}

const currencyFormatter = new Intl.NumberFormat("en-LK", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export function formatPrice(value) {
  const price = parseMenuPrice(value);
  return price === null ? null : `Rs ${currencyFormatter.format(price)}`;
}
