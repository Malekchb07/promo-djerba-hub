import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/site/PageHero";
import { BentoPromos } from "@/components/site/BentoPromos";
import { FeaturedProducts } from "@/components/site/FeaturedProducts";

export const Route = createFileRoute("/promotions")({
  component: PromotionsPage,
  head: () => ({
    meta: [
      { title: "Promotions de la semaine — PROMOFRAIS Djerba" },
      { name: "description", content: "Toutes les promotions actives PROMOFRAIS Djerba : offres flash, prix barrés, remises premium." },
    ],
  }),
});

function PromotionsPage() {
  return (
    <>
      <PageHero
        kicker="Semaine du 19 au 25 mai"
        title="Promotions premium, mises à jour chaque semaine."
        subtitle="Offres flash, prix barrés, marques exclusives — soigneusement sélectionnées par nos équipes Djerba."
      />
      <BentoPromos />
      <FeaturedProducts />
    </>
  );
}
