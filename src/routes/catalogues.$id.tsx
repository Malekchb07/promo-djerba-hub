import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Download, Share2, Link as LinkIcon, Maximize2, Minimize2, Check } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { getCatalogue } from "@/lib/coupons.functions";

const SITE = "https://promofrais.lovable.app";

export const Route = createFileRoute("/catalogues/$id")({
  component: CataloguePage,
  loader: async ({ params }) => {
    const { item } = await getCatalogue({ data: { id: params.id } });
    if (!item) throw notFound();
    return { item };
  },
  errorComponent: ({ error }) => <div className="min-h-[60vh] grid place-items-center text-sm text-muted-foreground">Erreur : {error.message}</div>,
  notFoundComponent: () => <div className="min-h-[60vh] grid place-items-center"><div className="text-center"><h1 className="font-display text-3xl mb-2">Catalogue introuvable</h1><Link to="/catalogues" className="text-gold hover:underline">Retour aux catalogues</Link></div></div>,
  head: ({ params, loaderData }) => {
    const title = `${loaderData?.item.title ?? "Catalogue"} — PROMOFRAIS Djerba`;
    const description = loaderData?.item.description ?? "Catalogue PROMOFRAIS Djerba";
    const url = `${SITE}/catalogues/${params.id}`;
    const cover = loaderData?.item.cover_url;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        ...(cover ? [
          { property: "og:image", content: cover },
          { name: "twitter:image", content: cover },
        ] : []),
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
});

function CataloguePage() {
  const { item } = Route.useLoaderData();
  const viewerRef = useRef<HTMLDivElement>(null);
  const [isFs, setIsFs] = useState(false);
  const [copied, setCopied] = useState(false);
  const shareUrl = typeof window !== "undefined" ? window.location.href : `${SITE}/catalogues/${item.id}`;

  useEffect(() => {
    const onChange = () => setIsFs(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  async function toggleFullscreen() {
    try {
      if (!document.fullscreenElement) await viewerRef.current?.requestFullscreen();
      else await document.exitFullscreen();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Plein écran indisponible");
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Lien copié");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Impossible de copier");
    }
  }

  async function share() {
    const data = { title: item.title, text: item.description ?? "Catalogue PROMOFRAIS Djerba", url: shareUrl };
    if (typeof navigator !== "undefined" && navigator.share) {
      try { await navigator.share(data); return; }
      catch { /* user cancelled */ return; }
    }
    copyLink();
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-surface/60 backdrop-blur sticky top-0 z-10">
        <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between gap-4">
          <Link to="/catalogues" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Catalogues</Link>
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-lg md:text-xl truncate">{item.title}</h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={copyLink} aria-label="Copier le lien"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-background/60 px-3 py-2 text-xs font-medium hover:border-gold/40 hover:text-gold">
              {copied ? <Check className="h-3.5 w-3.5" /> : <LinkIcon className="h-3.5 w-3.5" />}
              <span className="hidden sm:inline">{copied ? "Copié" : "Copier"}</span>
            </button>
            <button onClick={share} aria-label="Partager"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-background/60 px-3 py-2 text-xs font-medium hover:border-gold/40 hover:text-gold">
              <Share2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Partager</span>
            </button>
            <a href={item.pdf_url} download className="inline-flex items-center gap-2 rounded-full bg-gradient-gold px-4 py-2 text-xs font-bold text-gold-foreground">
              <Download className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Télécharger</span>
            </a>
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4 py-6">
        <div
          ref={viewerRef}
          className={`relative rounded-3xl overflow-hidden border border-border bg-card ${isFs ? "h-screen w-screen rounded-none" : "aspect-[4/5] md:aspect-[16/10]"}`}
        >
          <iframe src={`${item.pdf_url}#view=FitH&toolbar=1`} title={item.title} className="h-full w-full bg-white" />
          <button
            onClick={toggleFullscreen}
            aria-label={isFs ? "Quitter le plein écran" : "Plein écran"}
            className="absolute top-3 right-3 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background/80 backdrop-blur text-foreground hover:text-gold hover:border-gold/40 shadow-lg"
          >
            {isFs ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
        {item.description && <p className="mt-6 text-sm text-muted-foreground max-w-2xl">{item.description}</p>}
      </div>
    </div>
  );
}
