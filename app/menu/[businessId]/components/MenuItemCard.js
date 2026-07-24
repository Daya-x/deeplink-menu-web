"use client";

import Image from "next/image";
import {
  formatPrice,
  parseMenuPrice,
  safeImageUrl,
} from "@/lib/menu.mjs";

function PriceButton({ soldOut, price, label, onSelect }) {
  const parsedPrice = parseMenuPrice(price);
  const disabled = soldOut || parsedPrice === null;

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onSelect(label, parsedPrice)}
      className={`rounded-full px-4 py-2 text-xs font-bold border transition ${
        disabled
          ? "bg-gray-800 border-gray-700 text-gray-500 cursor-not-allowed"
          : "bg-transparent border-[#D6B56D] text-[#E6C78F] active:scale-95"
      }`}
    >
      {parsedPrice === null
        ? `${label} · Price unavailable`
        : `${label} · ${formatPrice(parsedPrice)}`}
    </button>
  );
}

export default function MenuItemCard({ item, onSelect, priority = false }) {
  const soldOut = item.isAvailable === false;
  const imageUrl = safeImageUrl(item.image);
  const singlePrice = parseMenuPrice(item.price);

  return (
    <article
      className={`rounded-[30px] border border-[#C6A76A]/15 bg-[#15110D] overflow-hidden shadow-[0_14px_45px_rgba(0,0,0,0.55)] transition active:scale-[0.99] ${
        soldOut ? "opacity-60" : ""
      }`}
    >
      <div className="flex gap-4 p-4">
        <div className="relative shrink-0 w-28 h-32 md:w-36 md:h-40">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={item.name || "Menu item"}
              fill
              priority={priority}
              sizes="(min-width: 768px) 144px, 112px"
              className="object-cover rounded-[22px]"
            />
          ) : (
            <div
              aria-hidden="true"
              className="w-full h-full bg-[#211914] rounded-[22px] flex items-center justify-center text-4xl"
            >
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
            {item.name || "Untitled item"}
          </h3>
          {item.description && (
            <p className="text-[#F5EBDD]/55 text-sm mt-2 line-clamp-2 leading-relaxed">
              {item.description}
            </p>
          )}

          {item.hasSizeOptions ? (
            <div className="mt-5 flex gap-2 flex-wrap">
              <PriceButton
                soldOut={soldOut}
                price={item.normalPrice}
                label="Normal"
                onSelect={onSelect}
              />
              <PriceButton
                soldOut={soldOut}
                price={item.fullPrice}
                label="Full"
                onSelect={onSelect}
              />
            </div>
          ) : (
            <div className="mt-5 flex items-center justify-between gap-3">
              <p className="font-semibold text-[#E6C78F] text-xl">
                {formatPrice(singlePrice) || "Price unavailable"}
              </p>
              <button
                type="button"
                disabled={soldOut || singlePrice === null}
                onClick={() => onSelect("Single", singlePrice)}
                className={`rounded-full px-5 py-2 text-xs font-bold border transition ${
                  soldOut || singlePrice === null
                    ? "bg-gray-800 border-gray-700 text-gray-500 cursor-not-allowed"
                    : "bg-transparent border-[#D6B56D] text-[#E6C78F] active:scale-95"
                }`}
              >
                {soldOut
                  ? "Unavailable"
                  : singlePrice === null
                    ? "No price"
                    : "Select"}
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
