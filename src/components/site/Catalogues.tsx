import { motion } from "framer-motion";
import { FileText, Download, ArrowUpRight, Loader2 } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { listPublicCatalogues } from "@/lib/coupons.functions";

export function Catalogues() {
  const list = useServerFn(listPublicCatalogues);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    list().then(({ items }) => {
      setItems(items.slice(0, 3));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

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
        {loading ? (
          <Loader2 className="h-6 w-6 animate-spin text-gold mx-auto" />
        ) : items.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">Aucun catalogue publié pour le moment.</div>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {items.map((c, i) => (
              <motion.article
                key={c.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card hover-lift"
              >
                <Link to="/catalogues/$id" params={{ id: c.id }} className="block">
                  <div className="relative aspect-[3/4] overflow-hidden bg-surface">
                    {c.cover_url ? (
                      <img src={c.cover_url} alt={c.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    ) : (
                      <div className="h-full w-full grid place-items-center"><FileText className="h-12 w-12 text-muted-foreground" /></div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
                    {c.badge && (
                      <span className="absolute top-4 left-4 rounded-full glass px-3 py-1 text-[10px] uppercase tracking-wider text-gold">{c.badge}</span>
                    )}
                    <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                      <div>
                        <h3 className="font-display text-xl mb-1">{c.title}</h3>
                        {c.page_count && (
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <FileText className="h-3 w-3" /> {c.page_count} pages
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
                <div className="absolute top-4 right-4">
                  <a
                    href={c.pdf_url}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    aria-label={`Télécharger ${c.title}`}
                    className="grid h-10 w-10 place-items-center rounded-full bg-gradient-gold text-gold-foreground transition-transform hover:scale-110"
                  >
                    <Download className="h-4 w-4" />
                  </a>
                </div>
                <div className="flex items-center justify-between p-4 text-xs">
                  <span className="text-muted-foreground">PDF</span>
                  <Link to="/catalogues/$id" params={{ id: c.id }} className="inline-flex items-center gap-1 text-gold hover:underline">
                    Feuilleter <ArrowUpRight className="h-3 w-3" />
                  </Link>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
