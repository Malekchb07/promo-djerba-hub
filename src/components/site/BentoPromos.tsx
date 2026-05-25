import { motion } from "framer-motion";
import { ArrowUpRight, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";

const MotionLink = motion(Link);
import tech from "@/assets/promo-tech.jpg";
import epicerie from "@/assets/promo-epicerie.jpg";
import beaute from "@/assets/promo-beaute.jpg";

function useCountdown(targetHours = 36) {
  const [mounted, setMounted] = useState(false);
  const [end, setEnd] = useState(0);
  const [now, setNow] = useState(0);
  useEffect(() => {
    const e = Date.now() + targetHours * 3600 * 1000;
    setEnd(e); setNow(Date.now()); setMounted(true);
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [targetHours]);
  if (!mounted) return { h: 0, m: 0, s: 0 };
  const diff = Math.max(0, end - now);
  return { h: Math.floor(diff / 3600000), m: Math.floor((diff % 3600000) / 60000), s: Math.floor((diff % 60000) / 1000) };
}

export function BentoPromos() {
  const c = useCountdown(36);
  return (
    <section className="relative mx-auto max-w-7xl px-4 py-20">
      <div className="mb-12 flex items-end justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-[0.3em] text-gold mb-3">Le meilleur de la semaine</div>
          <h2 className="font-display text-4xl md:text-6xl text-balance max-w-2xl">
            Promotions <span className="text-gold">premium</span>, soigneusement choisies.
          </h2>
        </div>
        <Link to="/promotions" className="hidden md:inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-gold">
          Toutes les promos <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-6 md:grid-rows-2 md:h-[640px]">
        {/* Hero promo */}
        <MotionLink
          to="/promotions"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="group relative md:col-span-4 md:row-span-2 overflow-hidden rounded-3xl border border-border hover-lift"
        >
          <img src={tech} alt="High-tech" width={1024} height={1024} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
          <div className="absolute top-6 left-6 flex items-center gap-2">
            <span className="rounded-full bg-primary px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary-foreground">-40%</span>
            <span className="glass rounded-full px-3 py-1 text-xs flex items-center gap-1.5 text-gold">
              <Clock className="h-3 w-3" /> {String(c.h).padStart(2, "0")}:{String(c.m).padStart(2, "0")}:{String(c.s).padStart(2, "0")}
            </span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-8 md:p-10">
            <div className="text-xs uppercase tracking-[0.2em] text-gold mb-3">High-tech & Électroménager</div>
            <h3 className="font-display text-3xl md:text-5xl mb-3 text-balance">Soldes Maison Connectée</h3>
            <p className="text-sm text-muted-foreground max-w-md mb-4">Petit électroménager, audio et accessoires premium — jusqu'à -40%.</p>
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-gold">
              Découvrir <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
            </span>
          </div>
        </MotionLink>

        <MotionLink
          to="/promotions"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="group relative md:col-span-2 overflow-hidden rounded-3xl border border-border hover-lift"
        >
          <img src={epicerie} alt="Épicerie Djerba" width={1024} height={1024} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
          <div className="absolute top-5 left-5">
            <span className="rounded-full bg-gold px-3 py-1 text-xs font-bold uppercase tracking-wider text-gold-foreground">Nouveau</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <h3 className="font-display text-2xl mb-1">Saveurs de Djerba</h3>
            <p className="text-xs text-muted-foreground">Épices, dattes & huile locale</p>
          </div>
        </MotionLink>

        <MotionLink
          to="/promotions"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="group relative md:col-span-2 overflow-hidden rounded-3xl border border-border hover-lift"
        >
          <img src={beaute} alt="Beauté & Parfums" width={1024} height={1024} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
          <div className="absolute top-5 left-5">
            <span className="rounded-full bg-primary px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary-foreground">-25%</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <h3 className="font-display text-2xl mb-1">Beauté & Parfums</h3>
            <p className="text-xs text-muted-foreground">Grandes marques sélectionnées</p>
          </div>
        </MotionLink>
      </div>
    </section>
  );
}
