import { createFileRoute, Link, useNavigate, redirect } from "@tanstack/react-router";
import { useEffect } from "react";
import { Heart, ShoppingCart, Trash2, PackageSearch } from "lucide-react";
import { motion } from "framer-motion";
import { PageHero } from "@/components/site/PageHero";
import { Button } from "@/components/ui/button";
import { useCart, useWishlist } from "@/hooks/use-shop-store";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export const Route = createFileRoute("/wishlist")({
  component: WishlistPage,
  head: () => ({
    meta: [
      { title: "Mes favoris — PROMOFRAIS" },
      { name: "description", content: "Retrouvez tous les produits que vous avez ajoutés à vos favoris." },
    ],
  }),
});

function WishlistPage() {
  const { user, isLoading } = useAuth();
  const { items, toggle } = useWishlist();
  const { add } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) {
      toast.error("Connectez-vous pour voir vos favoris");
      navigate({ to: "/login" });
    }
  }, [user, isLoading, navigate]);

  if (!user) return null;

  return (
    <main>
      <PageHero kicker="Mon espace" title="Mes favoris" subtitle={`${items.length} produit${items.length > 1 ? "s" : ""} sauvegardé${items.length > 1 ? "s" : ""}`} />
      <section className="mx-auto max-w-7xl px-4 py-12">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-16 text-center">
            <PackageSearch className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="font-display text-2xl mb-2">Aucun favori pour l'instant</h2>
            <p className="text-muted-foreground mb-6">Explorez nos produits et cliquez sur le cœur pour les retrouver ici.</p>
            <Button asChild><Link to="/products">Découvrir les produits</Link></Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {items.map((p, i) => (
              <motion.article
                key={p.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: Math.min(i * 0.04, 0.3) }}
                className="group overflow-hidden rounded-2xl border border-border bg-card hover-lift"
              >
                <div className="relative aspect-square overflow-hidden bg-surface-2">
                  {p.image_url ? (
                    <img src={p.image_url} alt={p.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  ) : (
                    <div className="grid h-full w-full place-items-center text-muted-foreground"><PackageSearch className="h-10 w-10" /></div>
                  )}
                  <button
                    type="button"
                    onClick={() => { toggle(p); toast.success("Retiré des favoris"); }}
                    className="absolute top-3 right-3 grid h-9 w-9 place-items-center rounded-full glass text-primary"
                    aria-label="Retirer des favoris"
                  >
                    <Heart className="h-4 w-4 fill-current" />
                  </button>
                </div>
                <div className="p-4">
                  <h3 className="font-display text-sm leading-tight mb-3 line-clamp-2 min-h-[2.5rem]">{p.name}</h3>
                  <div className="flex items-end justify-between gap-2">
                    <div className="font-display text-lg text-gold">{Number(p.price).toFixed(3)} DT</div>
                    <button
                      type="button"
                      onClick={() => { add(p); toast.success(`${p.name} ajouté au panier`); }}
                      className="grid h-9 w-9 place-items-center rounded-full bg-gradient-red text-primary-foreground shadow-red transition-transform hover:scale-110"
                      aria-label="Ajouter au panier"
                    >
                      <ShoppingCart className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
