import { motion } from "framer-motion";
import { Scissors, QrCode, Gift, Ticket } from "lucide-react";

const COUPONS = [
  { code: "FRAIS20", label: "-20% sur fruits & légumes", until: "31 mai", icon: Gift },
  { code: "BEAUTE15", label: "-15% beauté & parfums", until: "07 juin", icon: Ticket },
  { code: "TECH50", label: "-50 DT dès 300 DT high-tech", until: "12 juin", icon: QrCode },
];

export function CouponsTeaser() {
  return (
    <section className="relative overflow-hidden bg-surface/40 py-20">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-12 flex flex-col items-start gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-gold mb-3">Réservés aux fidèles</div>
            <h2 className="font-display text-4xl md:text-5xl">Vos coupons à activer</h2>
          </div>
          <p className="max-w-sm text-sm text-muted-foreground">
            Scannez le QR à la caisse ou présentez votre carte PROMOFRAIS. Cumul possible avec les promos en cours.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {COUPONS.map((c, i) => (
            <motion.div
              key={c.code}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group relative overflow-hidden rounded-2xl border border-gold/20 bg-gradient-to-br from-card to-surface-2 p-6 hover-lift"
            >
              <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-gold/10 blur-2xl transition-opacity group-hover:opacity-150" />
              <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 h-8 w-8 rounded-full bg-background" />
              <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 h-8 w-8 rounded-full bg-background" />
              <div className="relative flex items-start justify-between mb-6">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-gold/10 text-gold">
                  <c.icon className="h-5 w-5" />
                </div>
                <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Exp. {c.until}</span>
              </div>
              <h3 className="font-display text-xl mb-2">{c.label}</h3>
              <div className="my-4 border-t border-dashed border-gold/30" />
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Code</div>
                  <div className="font-display text-lg text-gold tracking-wider">{c.code}</div>
                </div>
                <button className="inline-flex items-center gap-2 rounded-full bg-gradient-gold px-4 py-2 text-xs font-bold text-gold-foreground transition-transform hover:scale-105">
                  <Scissors className="h-3.5 w-3.5" /> Récupérer
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
