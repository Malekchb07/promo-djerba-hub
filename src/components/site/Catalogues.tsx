import { motion } from "framer-motion";
import { FileText, Download, ArrowUpRight } from "lucide-react";
import hero from "@/assets/hero-fresh.jpg";
import beaute from "@/assets/promo-beaute.jpg";
import tech from "@/assets/promo-tech.jpg";

const CATALOGUES = [
  { title: "Catalogue Frais — Mai", pages: 24, img: hero, tag: "En cours" },
  { title: "Beauté Édition Or", pages: 18, img: beaute, tag: "Limité" },
  { title: "Tech & Maison Été", pages: 32, img: tech, tag: "Nouveau" },
];

export function Catalogues() {
  return (
    <section className="bg-surface/40 py-20">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-12 flex flex-col items-start gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-gold mb-3">À feuilleter</div>
            <h2 className="font-display text-4xl md:text-5xl">Nos catalogues</h2>
          </div>
          <p className="max-w-sm text-sm text-muted-foreground">
            Téléchargez ou consultez en ligne. Toutes les offres en un coup d'œil.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {CATALOGUES.map((c, i) => (
            <motion.a
              key={c.title}
              href="#"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card hover-lift"
            >
              <div className="relative aspect-[3/4] overflow-hidden">
                <img src={c.img} alt={c.title} width={800} height={1067} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
                <span className="absolute top-4 left-4 rounded-full glass px-3 py-1 text-[10px] uppercase tracking-wider text-gold">{c.tag}</span>
                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                  <div>
                    <h3 className="font-display text-xl mb-1">{c.title}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <FileText className="h-3 w-3" /> {c.pages} pages
                    </div>
                  </div>
                  <button className="grid h-10 w-10 place-items-center rounded-full bg-gradient-gold text-gold-foreground transition-transform group-hover:scale-110">
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 text-xs">
                <span className="text-muted-foreground">PDF · 12 Mo</span>
                <span className="inline-flex items-center gap-1 text-gold">Feuilleter <ArrowUpRight className="h-3 w-3" /></span>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
