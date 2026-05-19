import { motion } from "framer-motion";
import { Apple, Carrot, Tv, Sofa, Sparkles, Droplets, Cpu, Tag } from "lucide-react";
import fruits from "@/assets/cat-fruits.jpg";
import alim from "@/assets/cat-alimentaire.jpg";
import maison from "@/assets/cat-maison.jpg";
import tech from "@/assets/promo-tech.jpg";
import beaute from "@/assets/promo-beaute.jpg";
import epic from "@/assets/promo-epicerie.jpg";

const CATS = [
  { name: "Fruits & Légumes", icon: Carrot, img: fruits, count: 320 },
  { name: "Alimentaire", icon: Apple, img: alim, count: 1240 },
  { name: "High-tech", icon: Cpu, img: tech, count: 180 },
  { name: "Maison", icon: Sofa, img: maison, count: 540 },
  { name: "Beauté", icon: Sparkles, img: beaute, count: 290 },
  { name: "Hygiène", icon: Droplets, img: epic, count: 410 },
  { name: "Électroménager", icon: Tv, img: tech, count: 110 },
  { name: "Promotions", icon: Tag, img: fruits, count: 95 },
];

export function Categories() {
  return (
    <section className="relative bg-surface/40 py-20">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-12 text-center">
          <div className="text-xs uppercase tracking-[0.3em] text-gold mb-3">Univers PROMOFRAIS</div>
          <h2 className="font-display text-4xl md:text-5xl">Explorez nos catégories</h2>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {CATS.map((c, i) => (
            <motion.a
              key={c.name}
              href="#"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="group relative aspect-square overflow-hidden rounded-2xl border border-border hover-lift"
            >
              <img src={c.img} alt={c.name} width={800} height={800} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
              <div className="absolute top-4 right-4 grid h-10 w-10 place-items-center rounded-full glass">
                <c.icon className="h-4 w-4 text-gold" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <div className="font-display text-lg leading-tight">{c.name}</div>
                <div className="mt-1 text-xs text-muted-foreground">{c.count} produits</div>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
