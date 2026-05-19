import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/site/PageHero";
import { CouponsTeaser } from "@/components/site/CouponsTeaser";

export const Route = createFileRoute("/coupons")({
  component: CouponsPage,
  head: () => ({
    meta: [
      { title: "Coupons & bons de réduction — PROMOFRAIS Djerba" },
      { name: "description", content: "Récupérez vos coupons PROMOFRAIS Djerba : QR codes, remises exclusives, programme fidélité." },
    ],
  }),
});

function CouponsPage() {
  return (
    <>
      <PageHero
        kicker="Programme fidélité"
        title="Vos coupons, vos avantages."
        subtitle="Récupérez vos coupons en un clic. Présentez le QR code à la caisse pour profiter de la remise."
      />
      <CouponsTeaser />
    </>
  );
}
