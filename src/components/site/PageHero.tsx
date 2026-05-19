export function PageHero({ kicker, title, subtitle }: { kicker: string; title: string; subtitle?: string }) {
  return (
    <section className="relative border-b border-border bg-gradient-hero">
      <div className="absolute inset-0 grain pointer-events-none" />
      <div className="relative mx-auto max-w-7xl px-4 py-20 md:py-28">
        <div className="text-xs uppercase tracking-[0.3em] text-gold mb-4">{kicker}</div>
        <h1 className="font-display text-5xl md:text-7xl text-balance max-w-3xl">{title}</h1>
        {subtitle && <p className="mt-5 max-w-xl text-muted-foreground md:text-lg">{subtitle}</p>}
      </div>
    </section>
  );
}
