export default function Home() {
  return (
    <main className="min-h-screen bg-[#0B0907] text-[#F5EBDD] px-6 flex items-center justify-center">
      <section className="max-w-xl text-center">
        <p className="text-xs uppercase tracking-[0.4em] text-[#D6B56D]">
          DeepLink
        </p>
        <h1 className="mt-5 text-5xl sm:text-6xl font-semibold tracking-tight text-[#FFF7E8]">
          Your restaurant menu, one scan away.
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-[#F5EBDD]/60">
          Scan the QR code at your table or open the menu link shared by the
          restaurant to start browsing.
        </p>
      </section>
    </main>
  );
}
