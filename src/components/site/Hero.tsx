import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Zap } from "lucide-react";
import { Link } from "@tanstack/react-router";
import heroImg from "@/assets/hero-fresh.jpg";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-hero">
      <div className="absolute inset-0 grain pointer-events-none" />
      <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-primary/20 blur-3xl" />
      <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-gold/10 blur-3xl" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 md:py-28 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
          className="space-y-7"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/5 px-3 py-1.5 text-xs uppercase tracking-[0.2em] text-gold">
            <Sparkles className="h-3 w-3" /> Semaine du 19 au 25 mai
          </div>
          <h1 className="font-display text-5xl leading-[0.95] md:text-7xl lg:text-8xl text-balance">
            La fraîcheur,
            <br />
            <span className="text-gold">premium</span>
            <br />
            à Djerba.
          </h1>
          <p className="max-w-md text-base text-muted-foreground md:text-lg">
            Promotions hebdomadaires, coupons exclusifs et grandes marques —
            réservés à nos clients fidèles.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/promotions"
              className="group inline-flex items-center gap-2 rounded-full bg-gradient-red px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-red transition-transform hover:scale-[1.02]"
            >
              Voir les promos <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to="/coupons"
              className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/5 px-6 py-3.5 text-sm font-semibold text-gold transition-colors hover:bg-gold/10"
            >
              <Zap className="h-4 w-4" /> Mes coupons
            </Link>
          </div>
          <div className="flex gap-8 pt-6 border-t border-border/60">
            {[
              { n: "120+", l: "Promos / semaine" },
              { n: "3", l: "Magasins à Djerba" },
              { n: "50K+", l: "Clients fidèles" },
            ].map((s) => (
              <div key={s.l}>
                <div className="font-display text-2xl text-gold">{s.n}</div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">{s.l}</div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: [0.2, 0.8, 0.2, 1] }}
          className="relative"
        >
          <div className="absolute inset-0 -m-4 rounded-3xl bg-gradient-gold opacity-30 blur-2xl" />
          <div className="relative overflow-hidden rounded-3xl border border-gold/20 shadow-glow">
            <img
              src={heroImg}
              alt="Produits frais premium PROMOFRAIS Djerba"
              width={1600}
              height={1024}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="absolute bottom-6 left-6 right-6 glass rounded-2xl p-4 flex items-center justify-between"
            >
              <div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-gold">Offre flash</div>
                <div className="font-display text-lg">Huile d'olive Djerba 1L</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-muted-foreground line-through">22.500 DT</div>
                <div className="font-display text-2xl text-gold">14.900 DT</div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
