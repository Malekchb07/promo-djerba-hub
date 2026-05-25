import { motion } from "framer-motion";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { toast } from "sonner";
import { useCart, useWishlist } from "@/hooks/use-shop-store";
import fruits from "@/assets/cat-fruits.jpg";
import alim from "@/assets/cat-alimentaire.jpg";
import maison from "@/assets/cat-maison.jpg";
import tech from "@/assets/promo-tech.jpg";
import beaute from "@/assets/promo-beaute.jpg";
import epic from "@/assets/promo-epicerie.jpg";

const PRODUCTS = [
  { name: "Huile d'olive Djerba 1L", cat: "Épicerie", img: epic, price: 14.9, old: 22.5, badge: "-33%", rating: 4.9 },
  { name: "Casque audio sans-fil", cat: "High-tech", img: tech, price: 189, old: 259, badge: "-27%", rating: 4.7 },
  { name: "Coffret beauté édition or", cat: "Beauté", img: beaute, price: 79, old: 120, badge: "-34%", rating: 4.8 },
  { name: "Set vases céramique x3", cat: "Maison", img: maison, price: 64, old: 89, badge: "-28%", rating: 4.6 },
  { name: "Panier fruits & légumes 5kg", cat: "Frais", img: fruits, price: 24.5, old: 32, badge: "-23%", rating: 4.9 },
  { name: "Assortiment épicerie fine", cat: "Alimentaire", img: alim, price: 49, old: 69, badge: "-29%", rating: 4.5 },
];

export function FeaturedProducts() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20">
      <div className="mb-10 flex items-end justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.3em] text-gold mb-3">Sélection</div>
          <h2 className="font-display text-4xl md:text-5xl">Produits vedettes</h2>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-3">
        {PRODUCTS.map((p, i) => (
          <motion.article
            key={p.name}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.06 }}
            className="group relative overflow-hidden rounded-2xl border border-border bg-card hover-lift"
          >
            <div className="relative aspect-square overflow-hidden bg-surface-2">
              <img src={p.img} alt={p.name} width={800} height={800} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <span className="absolute top-3 left-3 rounded-full bg-primary px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">{p.badge}</span>
              <button className="absolute top-3 right-3 grid h-9 w-9 place-items-center rounded-full glass text-muted-foreground transition-colors hover:text-primary">
                <Heart className="h-4 w-4" />
              </button>
            </div>
            <div className="p-5">
              <div className="mb-1 text-[10px] uppercase tracking-[0.2em] text-gold">{p.cat}</div>
              <h3 className="font-display text-base leading-tight mb-3 line-clamp-2 min-h-[2.5rem]">{p.name}</h3>
              <div className="flex items-center gap-1 mb-3 text-xs text-muted-foreground">
                <Star className="h-3 w-3 fill-gold text-gold" /> {p.rating} <span className="opacity-50">· En stock</span>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-xs text-muted-foreground line-through">{p.old.toFixed(3)} DT</div>
                  <div className="font-display text-xl text-gold">{p.price.toFixed(3)} DT</div>
                </div>
                <button className="grid h-10 w-10 place-items-center rounded-full bg-gradient-red text-primary-foreground shadow-red transition-transform hover:scale-110">
                  <ShoppingCart className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
