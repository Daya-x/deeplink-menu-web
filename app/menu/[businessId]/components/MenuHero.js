"use client";

import Image from "next/image";
import { safeExternalUrl, safeImageUrl } from "@/lib/menu.mjs";

const socialLinks = [
  ["facebookUrl", "Facebook", "f"],
  ["instagramUrl", "Instagram", "in"],
  ["tiktokUrl", "TikTok", "♪"],
  ["googleReviewUrl", "Google review", "G"],
];

export default function MenuHero({ business }) {
  const coverUrl = safeImageUrl(business?.coverUrl);
  const logoUrl = safeImageUrl(business?.logoUrl);

  return (
    <section className="relative h-[420px] md:h-[500px] overflow-hidden bg-black">
      {coverUrl && (
        <Image
          src={coverUrl}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-45 scale-105"
        />
      )}

      <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-black/70 to-[#0B0907]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.35)_70%)]" />

      <div className="absolute top-5 right-4 z-20 flex items-center gap-2">
        {socialLinks.map(([field, label, icon]) => {
          const href = safeExternalUrl(business?.[field]);
          if (!href) return null;

          return (
            <a
              key={field}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="w-10 h-10 rounded-full border border-[#D8CBB7]/35 bg-black/55 backdrop-blur-xl flex items-center justify-center shadow-[0_8px_30px_rgba(0,0,0,0.45)] active:scale-95 transition text-xs font-bold text-[#F5EBDD]"
            >
              {icon}
            </a>
          );
        })}
      </div>

      <div className="absolute left-5 right-5 bottom-12 md:bottom-20 md:left-12">
        <div className="flex items-center gap-4 md:gap-7">
          <div className="relative shrink-0 w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-full overflow-hidden border border-[#D8CBB7] shadow-[0_0_32px_rgba(198,167,106,0.35)] bg-[#211914]">
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt={`${business?.businessName || "Restaurant"} logo`}
                fill
                sizes="(min-width: 768px) 128px, 96px"
                className="object-cover"
              />
            ) : (
              <span
                aria-hidden="true"
                className="absolute inset-0 flex items-center justify-center text-3xl"
              >
                🍽️
              </span>
            )}
          </div>

          <div className="shrink-0 w-px h-24 md:h-32 bg-[#D8CBB7]/60" />

          <div className="min-w-0 flex-1">
            <h1 className="text-[#D6B56D] text-[34px] sm:text-4xl md:text-6xl font-semibold leading-[0.95] tracking-tight break-words drop-shadow-lg">
              {business?.businessName || "Digital Menu"}
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
  );
}
