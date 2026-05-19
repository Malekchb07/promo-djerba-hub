import { createFileRoute } from "@tanstack/react-router";
import { MapPin, Clock, Phone, Navigation } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";

const STORES = [
  { name: "PROMOFRAIS Houmt Souk", addr: "Av. Habib Bourguiba, Houmt Souk", phone: "+216 75 650 100", hours: "8h — 22h, 7j/7" },
  { name: "PROMOFRAIS Midoun", addr: "Route Touristique, Midoun", phone: "+216 75 730 200", hours: "8h — 23h, 7j/7" },
  { name: "PROMOFRAIS Aghir", addr: "Zone Aghir, Djerba", phone: "+216 75 758 300", hours: "9h — 21h, 7j/7" },
];

export const Route = createFileRoute("/stores")({
  component: StoresPage,
  head: () => ({
    meta: [
      { title: "Nos magasins à Djerba — PROMOFRAIS" },
      { name: "description", content: "Adresses, horaires et itinéraires des magasins PROMOFRAIS à Djerba." },
    ],
  }),
});

function StoresPage() {
  return (
    <>
      <PageHero
        kicker="3 magasins à Djerba"
        title="Trouvez le PROMOFRAIS le plus proche."
        subtitle="Horaires étendus, parking gratuit, livraison et Click & Collect."
      />
      <section className="mx-auto max-w-7xl px-4 py-16 grid gap-6 md:grid-cols-3">
        {STORES.map((s) => (
          <div key={s.name} className="rounded-2xl border border-border bg-card p-6 hover-lift">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-gold/10 text-gold mb-5">
              <MapPin className="h-5 w-5" />
            </div>
            <h3 className="font-display text-xl mb-3">{s.name}</h3>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li className="flex items-start gap-2"><MapPin className="h-4 w-4 mt-0.5 text-gold shrink-0" /> {s.addr}</li>
              <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-gold" /> {s.phone}</li>
              <li className="flex items-center gap-2"><Clock className="h-4 w-4 text-gold" /> {s.hours}</li>
            </ul>
            <a href="#" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-gold">
              Itinéraire <Navigation className="h-4 w-4" />
            </a>
          </div>
        ))}
      </section>
      <section className="mx-auto max-w-7xl px-4 pb-20">
        <div className="aspect-[16/7] overflow-hidden rounded-3xl border border-border bg-surface-2 grid place-items-center text-muted-foreground">
          <div className="text-center">
            <MapPin className="h-10 w-10 mx-auto mb-3 text-gold" />
            <p className="text-sm">Carte Google Maps intégrée — disponible après publication</p>
          </div>
        </div>
      </section>
    </>
  );
}
