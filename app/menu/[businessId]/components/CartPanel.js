"use client";

import { formatPrice } from "@/lib/menu.mjs";

export default function CartPanel({
  cart,
  total,
  splitEnabled,
  splitCount,
  onRemove,
  onSplitEnabledChange,
  onSplitCountChange,
}) {
  if (cart.length === 0) return null;

  const perPerson = total / splitCount;

  return (
    <aside
      aria-label="Selected menu items"
      className="fixed bottom-0 left-0 right-0 z-50 bg-[#0B0907]/96 backdrop-blur-2xl border-t border-[#C6A76A]/20 shadow-[0_-12px_45px_rgba(0,0,0,0.85)] rounded-t-[28px]"
    >
      <div className="max-w-5xl mx-auto p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-lg">Selected Items</h2>
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
                  {formatPrice(item.price)}
                </span>
                <button
                  type="button"
                  onClick={() => onRemove(item.cartId)}
                  aria-label={`Remove ${item.name} from selected items`}
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
              {formatPrice(total)}
            </span>
          </div>

          {!splitEnabled ? (
            <button
              type="button"
              onClick={() => onSplitEnabledChange(true)}
              className="w-full rounded-2xl border border-[#C6A76A]/25 bg-[#15110D] px-4 py-3 font-semibold text-[#E6C78F] active:scale-95 transition"
            >
              Split Amount
            </button>
          ) : (
            <div className="bg-[#15110D] border border-[#C6A76A]/20 rounded-2xl p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">Split Total</p>
                  <p className="text-xs text-[#F5EBDD]/45">
                    Divide bill by friends count
                  </p>
                </div>
                <select
                  aria-label="Number of people"
                  value={splitCount}
                  onChange={(event) =>
                    onSplitCountChange(Number(event.target.value))
                  }
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
                  {formatPrice(perPerson)}
                </span>
              </div>
              <button
                type="button"
                onClick={() => onSplitEnabledChange(false)}
                className="mt-3 text-sm font-semibold text-red-300"
              >
                Cancel Split
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
