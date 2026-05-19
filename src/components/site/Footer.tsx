import { Link } from "@tanstack/react-router";
import { Mail, Phone, MapPin, Share2, Camera, Play } from "lucide-react";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="relative mt-24 border-t border-border bg-surface">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 md:grid-cols-4">
        <div className="space-y-4">
          <Logo />
          <p className="text-sm text-muted-foreground max-w-xs">
            La référence retail de Djerba. Fraîcheur, qualité et promotions premium chaque semaine.
          </p>
          <div className="flex gap-2">
            {[Share2, Camera, Play].map((Icon, i) => (
              <a key={i} href="#" className="grid h-9 w-9 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:border-gold/40 hover:text-gold">
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
        <div>
          <h4 className="mb-4 text-xs uppercase tracking-[0.2em] text-gold">Boutique</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/promotions" className="hover:text-foreground">Promotions</Link></li>
            <li><Link to="/products" className="hover:text-foreground">Produits</Link></li>
            <li><Link to="/coupons" className="hover:text-foreground">Coupons</Link></li>
            <li><Link to="/catalogues" className="hover:text-foreground">Catalogues</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-4 text-xs uppercase tracking-[0.2em] text-gold">Enseigne</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/stores" className="hover:text-foreground">Nos magasins</Link></li>
            <li><Link to="/contact" className="hover:text-foreground">Contact</Link></li>
            <li><a href="#" className="hover:text-foreground">Carrière</a></li>
            <li><a href="#" className="hover:text-foreground">Mentions légales</a></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-4 text-xs uppercase tracking-[0.2em] text-gold">Contact</h4>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex items-start gap-2"><MapPin className="h-4 w-4 mt-0.5 text-gold" /><span>Houmt Souk, Djerba 4180, Tunisie</span></li>
            <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-gold" /><span>+216 75 000 000</span></li>
            <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-gold" /><span>contact@promofrais.tn</span></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-6 text-xs text-muted-foreground md:flex-row">
          <p>© {new Date().getFullYear()} PROMOFRAIS Djerba — Tous droits réservés.</p>
          <p>Conçu avec soin pour les habitants & visiteurs de Djerba.</p>
        </div>
      </div>
    </footer>
  );
}
