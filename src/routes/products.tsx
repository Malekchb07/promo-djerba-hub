import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/site/PageHero";
import { Categories } from "@/components/site/Categories";
import { FeaturedProducts } from "@/components/site/FeaturedProducts";

export const Route = createFileRoute("/products")({
  component: ProductsPage,
  head: () => ({
    meta: [
      { title: "Tous les produits — PROMOFRAIS Djerba" },
      { name: "description", content: "Catalogue produits PROMOFRAIS : alimentaire, frais, beauté, high-tech, maison." },
    ],
  }),
});

function ProductsPage() {
  return (
    <>
      <PageHero
        kicker="Catalogue complet"
        title="Tous nos produits, en un seul endroit."
        subtitle="Filtrez par catégorie, marque ou promotion. Plus de 12 000 références disponibles en magasin."
      />
      <Categories />
      <FeaturedProducts />
    </>
  );
}
