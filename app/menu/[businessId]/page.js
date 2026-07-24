"use client";

import { use, useEffect, useRef, useState } from "react";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  calculateCartTotal,
  filterItemsByCategory,
  getCategories,
  getSubscriptionExpiry,
  isSubscriptionActive,
  parseMenuPrice,
  sortMenuItems,
} from "@/lib/menu.mjs";
import CartPanel from "./components/CartPanel";
import MenuHero from "./components/MenuHero";
import MenuItemCard from "./components/MenuItemCard";
import MenuStatus from "./components/MenuStatus";

export default function MenuPage({ params }) {
  const { businessId } = use(params);
  const nextCartId = useRef(0);

  const [business, setBusiness] = useState(null);
  const [items, setItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [cart, setCart] = useState([]);
  const [splitEnabled, setSplitEnabled] = useState(false);
  const [splitCount, setSplitCount] = useState(2);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [subscriptionActive, setSubscriptionActive] = useState(false);
  const [subscriptionExpiresAt, setSubscriptionExpiresAt] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadMenu() {
      setLoading(true);
      setLoadError(false);
      setNotFound(false);

      try {
        const businessSnap = await getDoc(doc(db, "businesses", businessId));
        if (cancelled) return;

        if (!businessSnap.exists()) {
          setNotFound(true);
          return;
        }

        const businessData = businessSnap.data();
        const subscription = businessData.subscription;
        const subscriptionIsActive = isSubscriptionActive(subscription);
        const expiry = getSubscriptionExpiry(subscription);

        setBusiness(businessData);
        setSubscriptionActive(subscriptionIsActive);
        setSubscriptionExpiresAt(expiry?.getTime() ?? null);

        if (!subscriptionIsActive) {
          setItems([]);
          setCart([]);
          return;
        }

        const menuSnap = await getDocs(
          collection(db, "businesses", businessId, "menuItems")
        );
        if (cancelled) return;

        const menuData = menuSnap.docs.map((menuDocument) => ({
          id: menuDocument.id,
          ...menuDocument.data(),
        }));

        setItems(sortMenuItems(menuData));
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to load menu:", error);
          setLoadError(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadMenu();
    return () => {
      cancelled = true;
    };
  }, [businessId, retryCount]);

  useEffect(() => {
    if (!subscriptionExpiresAt || !subscriptionActive) return;

    function expireSubscriptionIfNeeded() {
      if (Date.now() >= subscriptionExpiresAt) {
        setSubscriptionActive(false);
        setItems([]);
        setCart([]);
      }
    }

    expireSubscriptionIfNeeded();
    const interval = window.setInterval(expireSubscriptionIfNeeded, 30_000);
    return () => window.clearInterval(interval);
  }, [subscriptionActive, subscriptionExpiresAt]);

  if (loading) {
    return (
      <main
        aria-live="polite"
        className="min-h-screen flex items-center justify-center bg-[#0B0907] text-[#C6A76A]"
      >
        Loading menu...
      </main>
    );
  }

  if (loadError) {
    return (
      <MenuStatus
        title="Unable to Load Menu"
        message="We could not connect to the menu service. Check your connection and try again."
        actionLabel="Try Again"
        onAction={() => setRetryCount((count) => count + 1)}
      />
    );
  }

  if (notFound) {
    return (
      <MenuStatus
        title="Menu Not Found"
        message="This restaurant menu does not exist."
      />
    );
  }

  if (!subscriptionActive) {
    return (
      <MenuStatus
        title="Menu Temporarily Unavailable"
        message="This restaurant’s digital menu is currently unavailable. Please contact the restaurant owner."
      />
    );
  }

  const categories = getCategories(items);
  const filteredItems = filterItemsByCategory(items, activeCategory);

  function addToCart(item, size, price) {
    if (item.isAvailable === false) return;

    const parsedPrice = parseMenuPrice(price);
    if (parsedPrice === null) return;

    nextCartId.current += 1;
    const cartId = `${item.id}-${nextCartId.current}`;

    setCart((currentCart) => [
      ...currentCart,
      {
        cartId,
        id: item.id,
        name: item.name || "Untitled item",
        size,
        price: parsedPrice,
      },
    ]);
  }

  function removeFromCart(cartId) {
    setCart((currentCart) =>
      currentCart.filter((item) => item.cartId !== cartId)
    );
  }

  const total = calculateCartTotal(cart);

  return (
    <div
      className={`min-h-screen bg-[#0B0907] text-[#F5EBDD] ${
        cart.length > 0 ? "pb-72" : "pb-8"
      }`}
    >
      <MenuHero business={business} />

      <nav
        aria-label="Menu categories"
        className="sticky top-0 z-40 bg-[#0B0907]/82 backdrop-blur-2xl border-b border-[#C6A76A]/15"
      >
        <div className="max-w-5xl mx-auto flex gap-3 overflow-x-auto px-4 py-4">
          {categories.map((category) => (
            <button
              type="button"
              key={category}
              onClick={() => setActiveCategory(category)}
              aria-pressed={activeCategory === category}
              className={`whitespace-nowrap rounded-full px-6 py-3 text-sm font-semibold border transition active:scale-95 ${
                activeCategory === category
                  ? "bg-[#D6B56D] text-[#0B0907] border-[#D6B56D] shadow-[0_8px_25px_rgba(214,181,109,0.25)]"
                  : "bg-[#15110D]/80 text-[#D8CBB7] border-[#3A2F20]"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-10 md:px-6">
        <header className="flex items-end justify-between mb-7">
          <div>
            <p className="uppercase tracking-[0.28em] text-[#C6A76A] text-xs">
              Category
            </p>
            <h2 className="text-4xl md:text-5xl font-semibold mt-2 text-[#FFF7E8]">
              {activeCategory}
            </h2>
          </div>
          <p className="text-[#F5EBDD]/45 text-sm">
            {filteredItems.length}{" "}
            {filteredItems.length === 1 ? "item" : "items"}
          </p>
        </header>

        {filteredItems.length === 0 ? (
          <div className="rounded-[28px] border border-[#C6A76A]/15 bg-[#15110D] p-8 text-center shadow-[0_12px_45px_rgba(0,0,0,0.45)]">
            <p className="text-[#F5EBDD]/55">No items available.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredItems.map((item, index) => (
              <MenuItemCard
                key={item.id}
                item={item}
                priority={index === 0}
                onSelect={(size, price) => addToCart(item, size, price)}
              />
            ))}
          </div>
        )}
      </main>

      <footer className="border-t border-[#C6A76A]/15 mt-16 py-8 text-center">
        <p className="text-[10px] uppercase tracking-[0.35em] text-[#F5EBDD]/40">
          Powered by
        </p>
        <p className="mt-2 text-sm uppercase tracking-[0.4em] text-[#D6B56D] font-semibold">
          DeepLink
        </p>
      </footer>

      <CartPanel
        cart={cart}
        total={total}
        splitEnabled={splitEnabled}
        splitCount={splitCount}
        onRemove={removeFromCart}
        onSplitEnabledChange={setSplitEnabled}
        onSplitCountChange={setSplitCount}
      />
    </div>
  );
}
