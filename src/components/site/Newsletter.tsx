import { motion } from "framer-motion";
import { Send } from "lucide-react";

export function Newsletter() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-3xl border border-gold/20 bg-gradient-to-br from-surface-2 to-card p-10 md:p-16 text-center"
      >
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 h-60 w-[600px] rounded-full bg-gold/10 blur-3xl" />
        <div className="relative">
          <div className="text-xs uppercase tracking-[0.3em] text-gold mb-3">Restez informé</div>
          <h2 className="font-display text-3xl md:text-5xl mb-4 text-balance max-w-2xl mx-auto">
            Recevez nos promos & coupons en avant-première
          </h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Un email par semaine. Pas de spam — uniquement les meilleures offres de Djerba.
          </p>
          <form className="mx-auto flex max-w-md flex-col gap-2 sm:flex-row" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              required
              placeholder="votre@email.com"
              className="flex-1 rounded-full border border-border bg-background/60 px-5 py-3.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/40"
            />
            <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-red px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-red transition-transform hover:scale-[1.02]">
              S'inscrire <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </motion.div>
    </section>
  );
}
