import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Download } from "lucide-react";
import { getCatalogue } from "@/lib/coupons.functions";

export const Route = createFileRoute("/catalogues/$id")({
  component: CataloguePage,
  loader: async ({ params }) => {
    const { item } = await getCatalogue({ data: { id: params.id } });
    if (!item) throw notFound();
    return { item };
  },
  errorComponent: ({ error }) => <div className="min-h-[60vh] grid place-items-center text-sm text-muted-foreground">Erreur : {error.message}</div>,
  notFoundComponent: () => <div className="min-h-[60vh] grid place-items-center"><div className="text-center"><h1 className="font-display text-3xl mb-2">Catalogue introuvable</h1><Link to="/catalogues" className="text-gold hover:underline">Retour aux catalogues</Link></div></div>,
  head: ({ loaderData }) => ({ meta: [
    { title: `${loaderData?.item.title ?? "Catalogue"} — PROMOFRAIS Djerba` },
    { name: "description", content: loaderData?.item.description ?? "Catalogue PROMOFRAIS Djerba" },
    ...(loaderData?.item.cover_url ? [
      { property: "og:image", content: loaderData.item.cover_url },
      { name: "twitter:image", content: loaderData.item.cover_url },
    ] : []),
  ] }),
});

function CataloguePage() {
  const { item } = Route.useLoaderData();
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-surface/60 backdrop-blur sticky top-0 z-10">
        <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between gap-4">
          <Link to="/catalogues" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Catalogues</Link>
          <div className="min-w-0">
            <h1 className="font-display text-lg md:text-xl truncate">{item.title}</h1>
          </div>
          <a href={item.pdf_url} download className="inline-flex items-center gap-2 rounded-full bg-gradient-gold px-4 py-2 text-xs font-bold text-gold-foreground"><Download className="h-3.5 w-3.5" /> Télécharger</a>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="rounded-3xl overflow-hidden border border-border bg-card aspect-[4/5] md:aspect-[16/10]">
          <iframe src={`${item.pdf_url}#view=FitH&toolbar=1`} title={item.title} className="h-full w-full" />
        </div>
        {item.description && <p className="mt-6 text-sm text-muted-foreground max-w-2xl">{item.description}</p>}
      </div>
    </div>
  );
}
