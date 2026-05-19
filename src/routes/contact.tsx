import { createFileRoute } from "@tanstack/react-router";
import { Mail, Phone, MessageCircle, MapPin, Send } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
  head: () => ({
    meta: [
      { title: "Contact — PROMOFRAIS Djerba" },
      { name: "description", content: "Contactez l'équipe PROMOFRAIS Djerba : email, téléphone, WhatsApp et formulaire." },
    ],
  }),
});

function ContactPage() {
  return (
    <>
      <PageHero
        kicker="Service client"
        title="Une question ? Nous sommes à l'écoute."
        subtitle="Notre équipe répond du lundi au samedi, de 8h à 20h."
      />
      <section className="mx-auto max-w-7xl px-4 py-16 grid gap-10 md:grid-cols-2">
        <div className="space-y-4">
          {[
            { Icon: Phone, label: "Téléphone", value: "+216 75 000 000" },
            { Icon: Mail, label: "Email", value: "contact@promofrais.tn" },
            { Icon: MessageCircle, label: "WhatsApp", value: "+216 20 000 000" },
            { Icon: MapPin, label: "Siège", value: "Houmt Souk, Djerba 4180" },
          ].map(({ Icon, label, value }) => (
            <div key={label} className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5 hover-lift">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-gold/10 text-gold">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{label}</div>
                <div className="font-display text-lg">{value}</div>
              </div>
            </div>
          ))}
        </div>
        <form className="rounded-3xl border border-gold/20 bg-gradient-to-br from-card to-surface-2 p-8" onSubmit={(e) => e.preventDefault()}>
          <h3 className="font-display text-2xl mb-6">Écrivez-nous</h3>
          <div className="space-y-4">
            <input type="text" placeholder="Votre nom" required className="w-full rounded-xl border border-border bg-background/60 px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/40" />
            <input type="email" placeholder="Votre email" required className="w-full rounded-xl border border-border bg-background/60 px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/40" />
            <textarea placeholder="Votre message" rows={5} required className="w-full rounded-xl border border-border bg-background/60 px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/40 resize-none" />
            <button type="submit" className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-gradient-red px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-red transition-transform hover:scale-[1.01]">
              Envoyer <Send className="h-4 w-4" />
            </button>
          </div>
        </form>
      </section>
    </>
  );
}
