"use client";

import { use, useEffect, useState } from "react";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function MenuPage({ params }) {
  const { businessId } = use(params);

  const [business, setBusiness] = useState(null);
  const [items, setItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [cart, setCart] = useState([]);
  const [splitEnabled, setSplitEnabled] = useState(false);
  const [splitCount, setSplitCount] = useState(2);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [subscriptionActive, setSubscriptionActive] = useState(false);

  useEffect(() => {
    async function loadMenu() {
      try {
        const businessSnap = await getDoc(doc(db, "businesses", businessId));

        if (!businessSnap.exists()) {
          setNotFound(true);
          setLoading(false);
          return;
        }

        const businessData = businessSnap.data();
        setBusiness(businessData);

        const subscription = businessData.subscription;
        let active = false;

        if (
          subscription &&
          subscription.status === "active" &&
          subscription.expiresAt
        ) {
          let expiryDate;

          if (typeof subscription.expiresAt.toDate === "function") {
            expiryDate = subscription.expiresAt.toDate();
          } else if (subscription.expiresAt.seconds) {
            expiryDate = new Date(subscription.expiresAt.seconds * 1000);
          } else {
            expiryDate = new Date(subscription.expiresAt);
          }

          active = expiryDate.getTime() > Date.now();
        }

        setSubscriptionActive(active);

        if (!active) {
          setItems([]);
          setCart([]);
          setLoading(false);
          return;
        }

        const menuSnap = await getDocs(
          collection(db, "businesses", businessId, "menuItems")
        );

        const menuData = menuSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setItems(menuData);
        setLoading(false);
      } catch (error) {
        console.error("Failed to load menu:", error);
        setLoading(false);
      }
    }

    loadMenu();
  }, [businessId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B0907] text-[#C6A76A]">
        Loading menu...
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B0907] text-[#F5EBDD] px-6">
        <div className="max-w-md text-center rounded-[28px] border border-[#C6A76A]/20 bg-[#15110D] p-8">
          <h1 className="text-3xl font-bold text-[#C6A76A] mb-3">
            Menu Not Found
          </h1>
          <p className="text-[#F5EBDD]/60">
            This restaurant menu does not exist.
          </p>
          <p className="mt-6 text-[10px] uppercase tracking-[0.35em] text-[#F5EBDD]/35">
            Powered by DeepLink
          </p>
        </div>
      </div>
    );
  }

  if (!subscriptionActive) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B0907] text-[#F5EBDD] px-6">
        <div className="max-w-md text-center rounded-[28px] border border-[#C6A76A]/20 bg-[#15110D] p-8">
          <h1 className="text-3xl font-bold text-[#C6A76A] mb-3">
            Menu Temporarily Unavailable
          </h1>
          <p className="text-[#F5EBDD]/60 leading-relaxed">
            This restaurant’s digital menu is currently unavailable. Please
            contact the restaurant owner.
          </p>
          <p className="mt-6 text-[10px] uppercase tracking-[0.35em] text-[#F5EBDD]/35">
            Powered by DeepLink
          </p>
        </div>
      </div>
    );
  }

  const categories = [
    "All",
    ...new Set(items.map((item) => item.category || "Other")),
  ];

  const filteredItems =
    activeCategory === "All"
      ? items
      : items.filter((item) => item.category === activeCategory);

  const addToCart = (item, size, price) => {
    if (item.isAvailable === false) return;

    setCart([
      ...cart,
      {
        cartId: Date.now() + Math.random(),
        id: item.id,
        name: item.name,
        size,
        price: Number(price),
      },
    ]);
  };

  const removeFromCart = (cartId) => {
    setCart(cart.filter((item) => item.cartId !== cartId));
  };

  const total = cart.reduce((sum, item) => sum + item.price, 0);
  const perPerson = total / splitCount;

  return (
    <div className="min-h-screen bg-[#0B0907] text-[#F5EBDD] pb-72">
      <section className="relative h-[420px] md:h-[500px] overflow-hidden bg-black">
        {business?.coverUrl && (
          <img
            src={business.coverUrl}
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-45 scale-105"
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-black/70 to-[#0B0907]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.35)_70%)]" />

        <div className="absolute top-5 right-4 z-20 flex items-center gap-2">
          {business?.facebookUrl && (
            <a
              href={business.facebookUrl}
              target="_blank"
              className="w-10 h-10 rounded-full border border-[#D8CBB7]/35 bg-black/45 backdrop-blur-xl flex items-center justify-center shadow-[0_8px_30px_rgba(0,0,0,0.45)] active:scale-95 transition"
            >
              <img
                src="https://cdn-icons-png.flaticon.com/512/5968/5968764.png"
                alt="Facebook"
                className="w-5 h-5 object-contain"
              />
            </a>
          )}

          {business?.instagramUrl && (
            <a
              href={business.instagramUrl}
              target="_blank"
              className="w-10 h-10 rounded-full border border-[#D8CBB7]/35 bg-black/45 backdrop-blur-xl flex items-center justify-center shadow-[0_8px_30px_rgba(0,0,0,0.45)] active:scale-95 transition"
            >
              <img
                src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png"
                alt="Instagram"
                className="w-5 h-5 object-contain"
              />
            </a>
          )}

          {business?.tiktokUrl && (
            <a
              href={business.tiktokUrl}
              target="_blank"
              className="w-10 h-10 rounded-full border border-[#D8CBB7]/35 bg-black/45 backdrop-blur-xl flex items-center justify-center shadow-[0_8px_30px_rgba(0,0,0,0.45)] active:scale-95 transition"
            >
              <img
                src="https://cdn-icons-png.flaticon.com/512/3046/3046121.png"
                alt="TikTok"
                className="w-5 h-5 object-contain"
              />
            </a>
          )}

          {business?.googleReviewUrl && (
            <a
              href={business.googleReviewUrl}
              target="_blank"
              className="w-10 h-10 md:w-auto md:px-4 rounded-full border border-[#C6A76A]/55 bg-black/45 backdrop-blur-xl flex items-center justify-center md:gap-2 shadow-[0_8px_30px_rgba(0,0,0,0.45)] active:scale-95 transition"
            >
              <img
                src="https://cdn-icons-png.flaticon.com/512/300/300221.png"
                alt="Google"
                className="w-5 h-5 object-contain"
              />
              <span className="hidden md:inline text-[11px] uppercase tracking-[0.16em] text-[#D8CBB7] font-medium">
                Review
              </span>
            </a>
          )}
        </div>

        <div className="absolute left-5 right-5 bottom-12 md:bottom-20 md:left-12">
          <div className="flex items-center gap-4 md:gap-7">
            {business?.logoUrl ? (
              <div className="relative shrink-0 w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-full overflow-hidden border border-[#D8CBB7] shadow-[0_0_32px_rgba(198,167,106,0.35)] bg-[#211914]">
                <img
                  src={business.logoUrl}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="shrink-0 w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-full overflow-hidden border border-[#D8CBB7] shadow-[0_0_32px_rgba(198,167,106,0.35)] bg-[#211914] flex items-center justify-center text-3xl">
                🍽️
              </div>
            )}

            <div className="shrink-0 w-px h-24 md:h-32 bg-[#D8CBB7]/60" />

            <div className="min-w-0 flex-1">
              <h1 className="text-[#D6B56D] text-[34px] sm:text-4xl md:text-6xl font-semibold leading-[0.95] tracking-tight break-words drop-shadow-lg">
                {business?.businessName}
              </h1>

              <p className="mt-3 text-[#F5EBDD] uppercase tracking-[0.18em] text-[18px] md:text-3xl font-medium leading-tight">
                Signature Dining Experience
              </p>

              <p className="mt-3 text-[#F5EBDD]/75 uppercase tracking-[0.36em] text-[11px] md:text-sm font-medium">
                Digital Menu
              </p>
            </div>
          </div>
        </div>
      </section>

      <nav className="sticky top-0 z-50 bg-[#0B0907]/82 backdrop-blur-2xl border-b border-[#C6A76A]/15">
        <div className="max-w-5xl mx-auto flex gap-3 overflow-x-auto px-4 py-4">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
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
        <div className="flex items-end justify-between mb-7">
          <div>
            <p className="uppercase tracking-[0.28em] text-[#C6A76A] text-xs">
              Category
            </p>
            <h2 className="text-4xl md:text-5xl font-semibold mt-2 text-[#FFF7E8]">
              {activeCategory}
            </h2>
          </div>

          <p className="text-[#F5EBDD]/45 text-sm">
            {filteredItems.length} items
          </p>
        </div>

        {filteredItems.length === 0 ? (
          <div className="rounded-[28px] border border-[#C6A76A]/15 bg-[#15110D] p-8 text-center shadow-[0_12px_45px_rgba(0,0,0,0.45)]">
            <p className="text-[#F5EBDD]/55">No items available.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredItems.map((item) => {
              const soldOut = item.isAvailable === false;

              return (
                <article
                  key={item.id}
                  className={`rounded-[30px] border border-[#C6A76A]/15 bg-[#15110D] overflow-hidden shadow-[0_14px_45px_rgba(0,0,0,0.55)] transition active:scale-[0.99] ${
                    soldOut ? "opacity-60" : ""
                  }`}
                >
                  <div className="flex gap-4 p-4">
                    <div className="relative shrink-0">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-28 h-32 md:w-36 md:h-40 object-cover rounded-[22px]"
                        />
                      ) : (
                        <div className="w-28 h-32 md:w-36 md:h-40 bg-[#211914] rounded-[22px] flex items-center justify-center text-4xl">
                          🍽️
                        </div>
                      )}

                      {soldOut && (
                        <div className="absolute inset-0 bg-black/65 rounded-[22px] flex items-center justify-center">
                          <span className="bg-[#7f1d1d] text-white px-3 py-1 rounded-full text-[10px] font-bold tracking-wider">
                            NOT AVAILABLE
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 py-1">
                      <h3 className="text-xl font-semibold leading-tight text-[#FFF7E8]">
                        {item.name}
                      </h3>

                      <p className="text-[#F5EBDD]/55 text-sm mt-2 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>

                      {item.hasSizeOptions ? (
                        <div className="mt-5 flex gap-2 flex-wrap">
                          <button
                            disabled={soldOut}
                            onClick={() =>
                              addToCart(item, "Normal", item.normalPrice)
                            }
                            className={`rounded-full px-4 py-2 text-xs font-bold border transition ${
                              soldOut
                                ? "bg-gray-800 border-gray-700 text-gray-500"
                                : "bg-transparent border-[#D6B56D] text-[#E6C78F] active:scale-95"
                            }`}
                          >
                            Normal · Rs {item.normalPrice}
                          </button>

                          <button
                            disabled={soldOut}
                            onClick={() =>
                              addToCart(item, "Full", item.fullPrice)
                            }
                            className={`rounded-full px-4 py-2 text-xs font-bold border transition ${
                              soldOut
                                ? "bg-gray-800 border-gray-700 text-gray-500"
                                : "bg-transparent border-[#D6B56D] text-[#E6C78F] active:scale-95"
                            }`}
                          >
                            Full · Rs {item.fullPrice}
                          </button>
                        </div>
                      ) : (
                        <div className="mt-5 flex items-center justify-between gap-3">
                          <p className="font-semibold text-[#E6C78F] text-xl">
                            Rs {item.price}
                          </p>

                          <button
                            disabled={soldOut}
                            onClick={() =>
                              addToCart(item, "Single", item.price)
                            }
                            className={`rounded-full px-5 py-2 text-xs font-bold border transition ${
                              soldOut
                                ? "bg-gray-800 border-gray-700 text-gray-500"
                                : "bg-transparent border-[#D6B56D] text-[#E6C78F] active:scale-95"
                            }`}
                          >
                            {soldOut ? "Unavailable" : "Select"}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
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

      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#0B0907]/96 backdrop-blur-2xl border-t border-[#C6A76A]/20 shadow-[0_-12px_45px_rgba(0,0,0,0.85)] rounded-t-[28px]">
          <div className="max-w-5xl mx-auto p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-lg">Selected Items</h3>
              <span className="text-xs text-[#F5EBDD]/45">
                {cart.length} selected
              </span>
            </div>

            <div className="max-h-32 overflow-y-auto space-y-2 pr-1">
              {cart.map((item) => (
                <div
                  key={item.cartId}
                  className="flex justify-between items-center gap-3 text-sm bg-[#15110D] border border-[#C6A76A]/10 rounded-xl px-3 py-2"
                >
                  <span className="min-w-0 truncate">
                    {item.name}{" "}
                    <span className="text-[#F5EBDD]/45">({item.size})</span>
                  </span>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-semibold text-[#E6C78F]">
                      Rs {item.price}
                    </span>

                    <button
                      onClick={() => removeFromCart(item.cartId)}
                      className="text-red-400 font-bold"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-[#C6A76A]/15 mt-4 pt-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-xl">Total</span>
                <span className="font-bold text-2xl text-[#E6C78F]">
                  Rs {total}
                </span>
              </div>

              {!splitEnabled && (
                <button
                  onClick={() => setSplitEnabled(true)}
                  className="w-full rounded-2xl border border-[#C6A76A]/25 bg-[#15110D] px-4 py-3 font-semibold text-[#E6C78F] active:scale-95 transition"
                >
                  Split Amount
                </button>
              )}

              {splitEnabled && (
                <div className="bg-[#15110D] border border-[#C6A76A]/20 rounded-2xl p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold">Split Total</p>
                      <p className="text-xs text-[#F5EBDD]/45">
                        Divide bill by friends count
                      </p>
                    </div>

                    <select
                      value={splitCount}
                      onChange={(e) => setSplitCount(Number(e.target.value))}
                      className="border border-[#C6A76A]/30 rounded-xl px-3 py-2 bg-[#0B0907] text-[#F5EBDD] font-semibold"
                    >
                      {[2, 3, 4, 5, 6, 7, 8, 9, 10].map((count) => (
                        <option key={count} value={count}>
                          {count} people
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex justify-between items-center mt-3">
                    <span className="font-medium">
                      Per Person ({splitCount})
                    </span>

                    <span className="text-xl font-bold text-[#E6C78F]">
                      Rs {perPerson.toFixed(2)}
                    </span>
                  </div>

                  <button
                    onClick={() => setSplitEnabled(false)}
                    className="mt-3 text-sm font-semibold text-red-300"
                  >
                    Cancel Split
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}