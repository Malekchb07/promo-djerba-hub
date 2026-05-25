import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { ShoppingCart, Trash2, PackageSearch, Plus, Minus } from "lucide-react";
import { motion } from "framer-motion";
import { PageHero } from "@/components/site/PageHero";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-shop-store";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export const Route = createFileRoute("/cart")({
  component: CartPage,
  head: () => ({
    meta: [
      { title: "Mon panier — PROMOFRAIS" },
      { name: "description", content: "Consultez votre panier et finalisez votre commande." },
    ],
  }),
});

function CartPage() {
  const { user, isLoading } = useAuth();
  const { items, add, remove, clear, count } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) {
      toast.error("Connectez-vous pour voir votre panier");
      navigate({ to: "/login" });
    }
  }, [user, isLoading, navigate]);

  if (!user) return null;

  const total = items.reduce((s, i) => s + Number(i.price) * (i.qty || 1), 0);

  const decrement = (item: typeof items[number]) => {
    if ((item.qty || 1) <= 1) remove(item.id);
    else {
      // re-add to bump count would increment; instead manually rewrite
      const next = items.map((i) => (i.id === item.id ? { ...i, qty: (i.qty || 1) - 1 } : i));
      localStorage.setItem("promofrais:cart", JSON.stringify(next));
      window.dispatchEvent(new CustomEvent("shop-store-change", { detail: { key: "promofrais:cart" } }));
    }
  };

  return (
    <main>
      <PageHero kicker="Mon espace" title="Mon panier" subtitle={`${count} article${count > 1 ? "s" : ""}`} />
      <section className="mx-auto max-w-7xl px-4 py-12">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-16 text-center">
            <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="font-display text-2xl mb-2">Votre panier est vide</h2>
            <p className="text-muted-foreground mb-6">Découvrez nos promotions et ajoutez des produits.</p>
            <Button asChild><Link to="/products">Voir les produits</Link></Button>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
            <div className="space-y-3">
              {items.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: Math.min(i * 0.03, 0.2) }}
                  className="flex gap-4 rounded-2xl border border-border bg-card p-3"
                >
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-surface-2">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="grid h-full w-full place-items-center text-muted-foreground"><PackageSearch className="h-6 w-6" /></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display text-sm sm:text-base leading-tight line-clamp-2">{item.name}</h3>
                    <div className="mt-1 font-display text-base text-gold">{Number(item.price).toFixed(3)} DT</div>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <button
                      type="button"
                      onClick={() => { remove(item.id); toast.success("Retiré du panier"); }}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                      aria-label="Retirer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <div className="flex items-center gap-1 rounded-full border border-border">
                      <button onClick={() => decrement(item)} className="grid h-7 w-7 place-items-center text-muted-foreground hover:text-foreground" aria-label="Diminuer">
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-6 text-center text-sm font-semibold">{item.qty || 1}</span>
                      <button onClick={() => add(item)} className="grid h-7 w-7 place-items-center text-muted-foreground hover:text-foreground" aria-label="Augmenter">
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
              <button
                onClick={() => { clear(); toast.success("Panier vidé"); }}
                className="text-xs text-muted-foreground hover:text-destructive transition-colors"
              >
                Vider le panier
              </button>
            </div>
            <aside className="h-fit rounded-2xl border border-border bg-card p-6 lg:sticky lg:top-32">
              <h2 className="font-display text-xl mb-4">Récapitulatif</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-muted-foreground"><span>Sous-total</span><span>{total.toFixed(3)} DT</span></div>
                <div className="flex justify-between text-muted-foreground"><span>Livraison</span><span>À calculer</span></div>
              </div>
              <div className="my-4 border-t border-border" />
              <div className="flex justify-between items-end mb-6">
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="font-display text-2xl text-gold">{total.toFixed(3)} DT</span>
              </div>
              <Button className="w-full bg-gradient-red text-primary-foreground shadow-red" onClick={() => toast.info("Commande à venir prochainement")}>
                Passer commande
              </Button>
              <Button asChild variant="outline" className="w-full mt-2">
                <Link to="/products">Continuer mes achats</Link>
              </Button>
            </aside>
          </div>
        )}
      </section>
    </main>
  );
}
