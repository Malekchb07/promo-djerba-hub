import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, ShoppingCart, Heart, X, ChevronLeft, ChevronRight, PackageSearch } from "lucide-react";
import { useEffect, useState } from "react";
import { PageHero } from "@/components/site/PageHero";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { useCart, useWishlist } from "@/hooks/use-shop-store";
import { useAuth } from "@/hooks/use-auth";
import { listCatalog } from "@/lib/catalog.functions";
import { cn } from "@/lib/utils";

const searchSchema = z.object({
  q: fallback(z.string(), "").default(""),
  category: fallback(z.string(), "").default(""),
  sort: fallback(z.enum(["newest", "price-asc", "price-desc", "promo", "name"]), "newest").default("newest"),
  promoOnly: fallback(z.boolean(), false).default(false),
  inStock: fallback(z.boolean(), false).default(false),
  minPrice: fallback(z.number().min(0), 0).default(0),
  maxPrice: fallback(z.number().min(0), 0).default(0),
  page: fallback(z.number().int().min(1), 1).default(1),
});

const catalogQueryOptions = (search: z.infer<typeof searchSchema>) =>
  queryOptions({
    queryKey: ["catalog", search],
    queryFn: () =>
      listCatalog({
        data: {
          q: search.q,
          category: search.category,
          sort: search.sort,
          promoOnly: search.promoOnly,
          inStock: search.inStock,
          minPrice: search.minPrice || undefined,
          maxPrice: search.maxPrice || undefined,
          page: search.page,
          pageSize: 12,
        },
      }),
  });

export const Route = createFileRoute("/products")({
  validateSearch: zodValidator(searchSchema),
  loaderDeps: ({ search }) => search,
  loader: ({ context, deps }) => context.queryClient.ensureQueryData(catalogQueryOptions(deps)),
  component: ProductsPage,
  head: () => ({
    meta: [
      { title: "Tous les produits — PROMOFRAIS Djerba" },
      { name: "description", content: "Catalogue PROMOFRAIS : recherche, filtres par catégorie, prix, promotions et stock. Plus de 12 000 références." },
    ],
  }),
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-3xl px-4 py-20 text-center">
      <h2 className="font-display text-2xl mb-2">Erreur de chargement</h2>
      <p className="text-muted-foreground">{error.message}</p>
    </div>
  ),
  notFoundComponent: () => <div className="p-10">Introuvable</div>,
});

function ProductsPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/products" });
  const { data } = useSuspenseQuery(catalogQueryOptions(search));

  const [qLocal, setQLocal] = useState(search.q);
  useEffect(() => setQLocal(search.q), [search.q]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (qLocal !== search.q) {
        navigate({ search: (p: any) => ({ ...p, q: qLocal, page: 1 }) });
      }
    }, 300);
    return () => clearTimeout(t);
  }, [qLocal]);

  const update = (patch: Partial<z.infer<typeof searchSchema>>) =>
    navigate({ search: (p: any) => ({ ...p, ...patch, page: patch.page ?? 1 }) });

  const reset = () =>
    navigate({ search: () => ({ q: "", category: "", sort: "newest", promoOnly: false, inStock: false, minPrice: 0, maxPrice: 0, page: 1 }) });

  const activeFilters =
    (search.category ? 1 : 0) +
    (search.promoOnly ? 1 : 0) +
    (search.inStock ? 1 : 0) +
    (search.minPrice > 0 || search.maxPrice > 0 ? 1 : 0);

  return (
    <>
      <PageHero
        kicker="Catalogue"
        title="Tous nos produits."
        subtitle={`${data.total} référence${data.total > 1 ? "s" : ""} disponibles · livraison & retrait magasin.`}
      />

      <section className="mx-auto max-w-7xl px-4 py-8 md:py-12">
        {/* Sticky toolbar */}
        <div className="sticky top-16 z-30 -mx-4 mb-6 border-b border-border bg-background/85 backdrop-blur px-4 py-3 md:rounded-2xl md:border md:mx-0">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={qLocal}
                onChange={(e) => setQLocal(e.target.value)}
                placeholder="Rechercher un produit..."
                className="pl-10 pr-10 h-11"
              />
              {qLocal && (
                <button
                  onClick={() => setQLocal("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label="Effacer"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="md:hidden flex-1 h-11 gap-2">
                    <SlidersHorizontal className="h-4 w-4" />
                    Filtres
                    {activeFilters > 0 && (
                      <Badge variant="secondary" className="ml-1">{activeFilters}</Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[85vh] overflow-y-auto">
                  <SheetHeader className="mb-4">
                    <SheetTitle>Filtres</SheetTitle>
                  </SheetHeader>
                  <FiltersPanel data={data} search={search} update={update} reset={reset} />
                </SheetContent>
              </Sheet>

              <Select value={search.sort} onValueChange={(v) => update({ sort: v as any })}>
                <SelectTrigger className="h-11 w-full md:w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Nouveautés</SelectItem>
                  <SelectItem value="promo">Meilleures promos</SelectItem>
                  <SelectItem value="price-asc">Prix croissant</SelectItem>
                  <SelectItem value="price-desc">Prix décroissant</SelectItem>
                  <SelectItem value="name">Nom (A-Z)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-[260px_1fr]">
          {/* Desktop sidebar */}
          <aside className="hidden md:block sticky top-40 self-start max-h-[calc(100vh-10rem)] overflow-y-auto pr-2">
            <FiltersPanel data={data} search={search} update={update} reset={reset} />
          </aside>

          <div>
            {data.items.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-24 text-center">
                <PackageSearch className="h-10 w-10 text-muted-foreground mb-4" />
                <h3 className="font-display text-2xl mb-2">Aucun produit trouvé</h3>
                <p className="text-muted-foreground mb-6 max-w-sm">Essayez d'élargir vos critères ou réinitialisez les filtres.</p>
                <Button onClick={reset} variant="outline">Réinitialiser</Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
                  {data.items.map((p: any, i: number) => (
                    <ProductCard key={p.id} p={p} i={i} />
                  ))}
                </div>

                <Pagination
                  page={data.page}
                  totalPages={data.totalPages}
                  onPage={(page) => {
                    update({ page });
                    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                />
              </>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

function ProductCard({ p, i }: { p: any; i: number }) {
  const discount = p.old_price && p.old_price > p.price ? Math.round(((p.old_price - p.price) / p.old_price) * 100) : null;
  const { add } = useCart();
  const { has, toggle } = useWishlist();
  const { user } = useAuth();
  const navigate = useNavigate();
  const requireAuth = () => {
    if (!user) {
      toast.error("Connectez-vous pour continuer");
      navigate({ to: "/login" });
      return false;
    }
    return true;
  };
  const wished = has(p.id);
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(i * 0.03, 0.3) }}
      className="group relative overflow-hidden rounded-2xl border border-border bg-card hover-lift"
    >
      <div className="relative aspect-square overflow-hidden bg-surface-2">
        {p.image_url ? (
          <img
            src={p.image_url}
            alt={p.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="grid h-full w-full place-items-center text-muted-foreground">
            <PackageSearch className="h-10 w-10" />
          </div>
        )}
        {(p.promo_badge || discount) && (
          <span className="absolute top-3 left-3 rounded-full bg-primary px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
            {p.promo_badge ?? `-${discount}%`}
          </span>
        )}
        {p.stock === 0 && (
          <span className="absolute bottom-3 left-3 rounded-full bg-black/70 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
            Rupture
          </span>
        )}
        <button
          type="button"
          onClick={() => {
            if (!requireAuth()) return;
            const added = toggle({ id: p.id, name: p.name, price: Number(p.price), image_url: p.image_url });
            toast.success(added ? "Ajouté aux favoris" : "Retiré des favoris");
          }}
          className={`absolute top-3 right-3 grid h-9 w-9 place-items-center rounded-full glass transition-colors ${wished ? "text-primary" : "text-muted-foreground hover:text-primary"}`}
          aria-label="Favori"
        >
          <Heart className={`h-4 w-4 ${wished ? "fill-current" : ""}`} />
        </button>
      </div>
      <div className="p-3 sm:p-4">
        {p.categories?.name && (
          <div className="mb-1 text-[10px] uppercase tracking-[0.2em] text-gold truncate">{p.categories.name}</div>
        )}
        <h3 className="font-display text-sm sm:text-base leading-tight mb-3 line-clamp-2 min-h-[2.5rem]">{p.name}</h3>
        <div className="flex items-end justify-between gap-2">
          <div>
            {p.old_price && (
              <div className="text-[11px] text-muted-foreground line-through">{Number(p.old_price).toFixed(3)} DT</div>
            )}
            <div className="font-display text-lg sm:text-xl text-gold">{Number(p.price).toFixed(3)} DT</div>
          </div>
          <button
            type="button"
            disabled={p.stock === 0}
            onClick={() => {
              add({ id: p.id, name: p.name, price: Number(p.price), image_url: p.image_url });
              toast.success(`${p.name} ajouté au panier`);
            }}
            className="grid h-9 w-9 sm:h-10 sm:w-10 shrink-0 place-items-center rounded-full bg-gradient-red text-primary-foreground shadow-red transition-transform hover:scale-110 disabled:opacity-40 disabled:hover:scale-100"
            aria-label="Ajouter au panier"
          >
            <ShoppingCart className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.article>
  );
}


function FiltersPanel({
  data,
  search,
  update,
  reset,
}: {
  data: any;
  search: z.infer<typeof searchSchema>;
  update: (p: Partial<z.infer<typeof searchSchema>>) => void;
  reset: () => void;
}) {
  const maxBound = Math.max(100, Math.ceil(Number(data.maxPrice) || 100));
  const minVal = search.minPrice || 0;
  const maxVal = search.maxPrice || maxBound;

  return (
    <div className="space-y-7">
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-display text-sm uppercase tracking-[0.2em] text-muted-foreground">Catégories</h4>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => update({ category: "" })}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs transition-colors",
              !search.category ? "border-gold bg-gold/10 text-gold" : "border-border hover:border-gold/50",
            )}
          >
            Toutes
          </button>
          {data.categories.map((c: any) => (
            <button
              key={c.id}
              onClick={() => update({ category: c.slug })}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs transition-colors",
                search.category === c.slug ? "border-gold bg-gold/10 text-gold" : "border-border hover:border-gold/50",
              )}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-display text-sm uppercase tracking-[0.2em] text-muted-foreground mb-3">Prix</h4>
        <div className="px-1">
          <Slider
            min={0}
            max={maxBound}
            step={1}
            value={[minVal, maxVal]}
            onValueChange={([min, max]) => update({ minPrice: min, maxPrice: max })}
            className="my-4"
          />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{minVal.toFixed(0)} DT</span>
            <span>{maxVal.toFixed(0)} DT</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="font-display text-sm uppercase tracking-[0.2em] text-muted-foreground">Options</h4>
        <label className="flex items-center gap-3 cursor-pointer">
          <Checkbox
            checked={search.promoOnly}
            onCheckedChange={(v) => update({ promoOnly: !!v })}
          />
          <span className="text-sm">En promotion uniquement</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <Checkbox
            checked={search.inStock}
            onCheckedChange={(v) => update({ inStock: !!v })}
          />
          <span className="text-sm">En stock</span>
        </label>
      </div>

      <Button variant="outline" onClick={reset} className="w-full">
        Réinitialiser les filtres
      </Button>
    </div>
  );
}

function Pagination({ page, totalPages, onPage }: { page: number; totalPages: number; onPage: (p: number) => void }) {
  if (totalPages <= 1) return null;
  const pages: (number | "…")[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || Math.abs(i - page) <= 1) pages.push(i);
    else if (pages[pages.length - 1] !== "…") pages.push("…");
  }
  return (
    <nav className="mt-10 flex items-center justify-center gap-1.5" aria-label="Pagination">
      <Button variant="outline" size="icon" disabled={page === 1} onClick={() => onPage(page - 1)} aria-label="Précédent">
        <ChevronLeft className="h-4 w-4" />
      </Button>
      {pages.map((p, idx) =>
        p === "…" ? (
          <span key={idx} className="px-2 text-muted-foreground">…</span>
        ) : (
          <Button
            key={p}
            variant={p === page ? "default" : "outline"}
            size="icon"
            onClick={() => onPage(p)}
            className={cn("min-w-9", p === page && "bg-gradient-red text-primary-foreground")}
          >
            {p}
          </Button>
        ),
      )}
      <Button variant="outline" size="icon" disabled={page === totalPages} onClick={() => onPage(page + 1)} aria-label="Suivant">
        <ChevronRight className="h-4 w-4" />
      </Button>
    </nav>
  );
}
