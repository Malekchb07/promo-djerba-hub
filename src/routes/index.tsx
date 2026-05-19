import { createFileRoute } from "@tanstack/react-router";
import { Hero } from "@/components/site/Hero";
import { BentoPromos } from "@/components/site/BentoPromos";
import { Categories } from "@/components/site/Categories";
import { FeaturedProducts } from "@/components/site/FeaturedProducts";
import { CouponsTeaser } from "@/components/site/CouponsTeaser";
import { Competitions } from "@/components/site/Competitions";
import { Catalogues } from "@/components/site/Catalogues";
import { Newsletter } from "@/components/site/Newsletter";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "PROMOFRAIS Djerba — Promotions, coupons & catalogues" },
      { name: "description", content: "Découvrez les promotions de la semaine, coupons exclusifs et catalogues PROMOFRAIS à Djerba." },
    ],
  }),
});

function Index() {
  return (
    <>
      <Hero />
      <BentoPromos />
      <Categories />
      <FeaturedProducts />
      <CouponsTeaser />
      <Competitions />
      <Catalogues />
      <Newsletter />
    </>
  );
}
