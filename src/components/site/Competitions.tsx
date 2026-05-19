import { motion } from "framer-motion";
import { Trophy, Sparkles } from "lucide-react";

export function Competitions() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="relative overflow-hidden rounded-3xl border border-gold/30 bg-gradient-to-br from-card via-surface-2 to-card p-10 md:p-16"
      >
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-gold/15 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-primary/15 blur-3xl" />
        <div className="grain absolute inset-0" />

        <div className="relative grid gap-10 md:grid-cols-2 md:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/5 px-3 py-1.5 text-xs uppercase tracking-[0.2em] text-gold mb-6">
              <Sparkles className="h-3 w-3" /> Grand jeu de l'été
            </div>
            <h2 className="font-display text-4xl md:text-6xl mb-5 text-balance">
              Tournez la <span className="text-gold">roue d'or</span> et gagnez gros.
            </h2>
            <p className="text-muted-foreground mb-7 max-w-md">
              Pour chaque achat de plus de 50 DT, participez à notre tirage hebdomadaire.
              À gagner : bons d'achat, électroménager, séjours à Djerba et le grand prix : 1 an de courses offertes.
            </p>
            <button className="inline-flex items-center gap-2 rounded-full bg-gradient-red px-7 py-4 text-sm font-semibold text-primary-foreground shadow-red transition-transform hover:scale-[1.02]">
              <Trophy className="h-4 w-4" /> Participer maintenant
            </button>
          </div>

          <div className="relative aspect-square max-w-sm mx-auto w-full">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
              className="relative h-full w-full"
            >
              <div className="absolute inset-0 rounded-full bg-gradient-gold shadow-glow" />
              <div className="absolute inset-3 rounded-full bg-background" />
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute top-1/2 left-1/2 h-px w-1/2 origin-left bg-gold/40"
                  style={{ transform: `rotate(${i * 45}deg)` }}
                />
              ))}
              {["500 DT", "Café", "10%", "Panier", "100 DT", "TV", "Coupon", "Séjour"].map((label, i) => (
                <div
                  key={label}
                  className="absolute top-1/2 left-1/2 -translate-y-1/2 origin-left text-[10px] font-display text-gold uppercase tracking-wider"
                  style={{ transform: `rotate(${i * 45 + 22.5}deg) translateX(28%)` }}
                >
                  {label}
                </div>
              ))}
            </motion.div>
            <div className="absolute inset-0 grid place-items-center">
              <div className="grid h-20 w-20 place-items-center rounded-full bg-gradient-red text-primary-foreground font-display shadow-red">
                SPIN
              </div>
            </div>
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 h-0 w-0 border-l-[10px] border-r-[10px] border-t-[16px] border-l-transparent border-r-transparent border-t-gold" />
          </div>
        </div>
      </motion.div>
    </section>
  );
}
