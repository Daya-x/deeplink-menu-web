"use client";

export default function MenuStatus({
  title,
  message,
  actionLabel,
  onAction,
}) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[#0B0907] text-[#F5EBDD] px-6">
      <section className="w-full max-w-md text-center rounded-[28px] border border-[#C6A76A]/20 bg-[#15110D] p-8">
        <h1 className="text-3xl font-bold text-[#C6A76A] mb-3">{title}</h1>
        <p className="text-[#F5EBDD]/60 leading-relaxed">{message}</p>

        {onAction && (
          <button
            type="button"
            onClick={onAction}
            className="mt-6 rounded-full bg-[#D6B56D] px-6 py-3 font-semibold text-[#0B0907] transition active:scale-95"
          >
            {actionLabel}
          </button>
        )}

        <p className="mt-6 text-[10px] uppercase tracking-[0.35em] text-[#F5EBDD]/35">
          Powered by DeepLink
        </p>
      </section>
    </main>
  );
}
