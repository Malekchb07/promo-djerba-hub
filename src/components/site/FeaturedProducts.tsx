import { motion } from "framer-motion";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useCart, useWishlist } from "@/hooks/use-shop-store";
import { useAuth } from "@/hooks/use-auth";
import { listCatalog } from "@/lib/catalog.functions";

export function FeaturedProducts() {
  const { add } = useCart();
  const { has, toggle } = useWishlist();
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data } = useQuery({
    queryKey: ["featured-products"],
    queryFn: () => listCatalog({ data: { sort: "promo", pageSize: 6, page: 1 } }),
  });
  const products = data?.items ?? [];

  const requireAuth = () => {
    if (!user) {
      toast.error("Connectez-vous pour continuer");
      navigate({ to: "/login" });
      return false;
    }
    return true;
  };

  if (products.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-20">
      <div className="mb-10 flex items-end justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.3em] text-gold mb-3">Sélection</div>
          <h2 className="font-display text-4xl md:text-5xl">Produits vedettes</h2>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-3">
        {products.map((p: any, i: number) => (
          <motion.article
            key={p.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.06 }}
            className="group relative overflow-hidden rounded-2xl border border-border bg-card hover-lift"
          >
            <div className="relative aspect-square overflow-hidden bg-surface-2">
              {p.image_url && (
                <img src={p.image_url} alt={p.name} width={800} height={800} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
              )}
              {p.promo_badge && (
                <span className="absolute top-3 left-3 rounded-full bg-primary px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">{p.promo_badge}</span>
              )}
              <button
                type="button"
                onClick={() => {
                  if (!requireAuth()) return;
                  const added = toggle({ id: p.id, name: p.name, price: Number(p.price), image_url: p.image_url });
                  toast.success(added ? "Ajouté aux favoris" : "Retiré des favoris");
                }}
                className={`absolute top-3 right-3 grid h-9 w-9 place-items-center rounded-full glass transition-colors ${has(p.id) ? "text-primary" : "text-muted-foreground hover:text-primary"}`}
                aria-label="Favori"
              >
                <Heart className={`h-4 w-4 ${has(p.id) ? "fill-current" : ""}`} />
              </button>
            </div>

            <div className="p-5">
              <div className="mb-1 text-[10px] uppercase tracking-[0.2em] text-gold">{p.categories?.name ?? ""}</div>
              <h3 className="font-display text-base leading-tight mb-3 line-clamp-2 min-h-[2.5rem]">{p.name}</h3>
              <div className="flex items-center gap-1 mb-3 text-xs text-muted-foreground">
                <Star className="h-3 w-3 fill-gold text-gold" /> 4.8
                <span className="opacity-50">· {p.stock > 0 ? "En stock" : "Épuisé"}</span>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  {p.old_price && <div className="text-xs text-muted-foreground line-through">{Number(p.old_price).toFixed(3)} DT</div>}
                  <div className="font-display text-xl text-gold">{Number(p.price).toFixed(3)} DT</div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (!requireAuth()) return;
                    add({ id: p.id, name: p.name, price: Number(p.price), image_url: p.image_url });
                    toast.success(`${p.name} ajouté au panier`);
                  }}
                  className="grid h-10 w-10 place-items-center rounded-full bg-gradient-red text-primary-foreground shadow-red transition-transform hover:scale-110"
                  aria-label="Ajouter au panier"
                >
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
