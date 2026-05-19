import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/site/PageHero";
import { Catalogues } from "@/components/site/Catalogues";

export const Route = createFileRoute("/catalogues")({
  component: CataloguesPage,
  head: () => ({
    meta: [
      { title: "Catalogues PDF — PROMOFRAIS Djerba" },
      { name: "description", content: "Téléchargez et feuilletez les catalogues PROMOFRAIS Djerba." },
    ],
  }),
});

function CataloguesPage() {
  return (
    <>
      <PageHero
        kicker="Nos publications"
        title="Catalogues à feuilleter ou télécharger."
        subtitle="Toutes nos offres en version PDF interactive — partagez-les avec vos proches."
      />
      <Catalogues />
    </>
  );
}
