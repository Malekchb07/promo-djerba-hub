import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { motion } from "framer-motion";
import { FileText, Download, ArrowUpRight, Loader2 } from "lucide-react";
import { listPublicCatalogues } from "@/lib/coupons.functions";
import { PageHero } from "@/components/site/PageHero";

export const Route = createFileRoute("/catalogues")({
  component: CataloguesPage,
  head: () => ({ meta: [
    { title: "Catalogues PDF — PROMOFRAIS Djerba" },
    { name: "description", content: "Téléchargez et feuilletez les catalogues PROMOFRAIS Djerba." },
  ] }),
});

function CataloguesPage() {
  const list = useServerFn(listPublicCatalogues);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { list().then(({ items }) => { setItems(items); setLoading(false); }); }, []);

  return (
    <>
      <PageHero kicker="Nos publications" title="Catalogues à feuilleter ou télécharger." subtitle="Toutes nos offres en version PDF interactive — partagez-les avec vos proches." />
      <section className="mx-auto max-w-7xl px-4 py-16">
        {loading ? <Loader2 className="h-6 w-6 animate-spin text-gold mx-auto" /> : (
          <div className="grid gap-6 md:grid-cols-3">
            {items.map((c, i) => (
              <motion.div key={c.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.08 }}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card hover-lift">
                <Link to="/catalogues/$id" params={{ id: c.id }} className="block">
                  <div className="relative aspect-[3/4] overflow-hidden bg-surface">
                    {c.cover_url ? <img src={c.cover_url} alt={c.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" /> : <div className="h-full w-full grid place-items-center"><FileText className="h-12 w-12 text-muted-foreground" /></div>}
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
                    {c.badge && <span className="absolute top-4 left-4 rounded-full glass px-3 py-1 text-[10px] uppercase tracking-wider text-gold">{c.badge}</span>}
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="font-display text-xl mb-1">{c.title}</h3>
                      {c.page_count && <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><FileText className="h-3 w-3" /> {c.page_count} pages</div>}
                    </div>
                  </div>
                </Link>
                <div className="flex items-center justify-between p-4 text-xs">
                  <a href={c.pdf_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground"><Download className="h-3 w-3" /> Télécharger</a>
                  <Link to="/catalogues/$id" params={{ id: c.id }} className="inline-flex items-center gap-1 text-gold">Feuilleter <ArrowUpRight className="h-3 w-3" /></Link>
                </div>
              </motion.div>
            ))}
            {items.length === 0 && <div className="md:col-span-3 text-center text-muted-foreground py-16">Aucun catalogue publié pour le moment.</div>}
          </div>
        )}
      </section>
    </>
  );
}
